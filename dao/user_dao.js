/**
 * Created by kamaron on 3/31/15.
 */
'use strict';

var bcrypt = require('bcrypt'),
    credentials = require('./credentials');

var work_factor = 10;

exports.checkUserExists = function (username, cb) {
    if (username === undefined || username === '') {
        cb(undefined, 'No user information provided!');
    } else {
        credentials.zora_query('SELECT id FROM User WHERE user_name = ?;', username, function (err, res) {
            if (err) {
                cb(null, err);
            } else {
                cb(res.length > 0);
            }
        });
    }
};

exports.authUser = function (username, password, cb) {
    if (username === undefined || username === '') {
        cb(undefined, 'No username provided!');
    } else if (password === undefined || password === '') {
        cb(undefined, 'No password provided!');
    } else {
        credentials.zora_query('SELECT pass_hash FROM User WHERE user_name = ?;', [username],
            function (err, res) {
                if (err) {
                    cb(undefined, 'SQL error: ' + err);
                } else if (res.length != 1) {
                    cb(undefined, 'User not found');
                } else {
                    auth(res[0]['pass_hash']);
                }
            }
        );
    }

    function auth(ph) {
        bcrypt.compare(password, ph, function (err, res) {
            if (err) {
                cb(undefined, 'Error authenticating password: ' + err);
            } else {
                cb(res);
            }
        });
    }
};

/**
 * getUserData: Gets information about the user with the given username
 * @param username Username of user in question
 * @param sensitive True to return sensitive user data, false to omit
 * @param cb Callback to invoke on read (res, err)
 */
exports.getUserData = function (username, sensitive, cb) {
    if (username === undefined || username === '') {
        cb(undefined, 'Must provide user name');
    } else if (sensitive === true) {
        credentials.zora_query('SELECT User.id, User.user_name, User.email_address, User.name, User.is_admin, '
        + 'UserType.name AS type FROM User LEFT JOIN UserType ON UserType.id = User.user_type WHERE '
        + 'User.user_name = ?;', username, function (err, res) {
            if (res.length != 1) {
                cb(undefined, 'User not found!');
            } else {
                cb({
                    id: res[0].id,
                    user_name: res[0].user_name,
                    email_address: res[0].email_address,
                    name: res[0].name,
                    is_admin: res[0].is_admin[0],
                    type: res[0].type
                });
            }
        });
    } else {
        credentials.zora_query('SELECT User.id, User.user_name, User.is_admin, '
        + 'UserType.name AS type FROM User LEFT JOIN UserType ON UserType.id = User.user_type WHERE '
        + 'User.user_name = ?;', username, function (err, res) {
            if (res.length != 1) {
                cb(undefined, 'User not found!');
            } else {
                cb({
                    id: res[0].id,
                    user_name: res[0].user_name,
                    is_admin: res[0].is_admin[0],
                    type: res[0].type
                });
            }
        });
    }
};

/**
 * getUserByID: Gets a given user from the database, given that user's ID.
 *              Useful in administrative functions
 * @param userID ID of user
 * @param sensitive True to include sensitive user data, false to omit
 * @param cb Callback to invoke on read (res, err)
 */
exports.getUserById = function (userID, sensitive, cb) {
    if (userID === undefined) {
        cb(undefined, 'Must provide User ID!');
    } else if (sensitive === true) {
        credentials.zora_query('SELECT User.id, User.user_name, User.email_address, User.name, User.is_admin, '
        + 'UserType.name AS type FROM User LEFT JOIN UserType ON UserType.id = User.user_type WHERE '
        + 'User.id = ?;', userID, function (err, res) {
            if (res.length != 1) {
                cb(undefined, 'User not found!');
            } else {
                cb({
                    id: res[0].id,
                    user_name: res[0].user_name,
                    email_address: res[0].email_address,
                    name: res[0].name,
                    is_admin: res[0].is_admin[0],
                    type: res[0].type
                });
            }
        });
    } else {
        credentials.zora_query('SELECT User.id, User.user_name, User.is_admin, '
        + 'UserType.name AS type FROM User LEFT JOIN UserType ON UserType.id = User.user_type WHERE '
        + 'User.id = ?;', userID, function (err, res) {
            if (res.length != 1) {
                cb(undefined, 'User not found!');
            } else {
                cb({
                    id: res[0].id,
                    user_name: res[0].user_name,
                    is_admin: res[0].is_admin[0],
                    type: res[0].type
                });
            }
        });
    }
};

/**
 * Method to add a user to the database
 * @param name Name of the user (e.g., "Kamaron Peterson")
 * @param user_name Username for the new user (e.g., "Sessamekesh")
 * @param password Password to use. This is NOT stored plain text.
 * @param email_address Email address of the user (e.g., "kamaron.peterson@gmail.com")
 * @param user_type User type - int, corresponds to entry from "UserType" table/dao)
 * @param cb Callback function to invoke after user is added or on failure (res, err)
 *          Res will be true on success, undefined on failure
 */
exports.addUser = function (name, user_name, password, email_address, user_type, cb) {
    if (name === undefined || name === '') {
        cb(undefined, 'Must specify the name of the account owner');
    } else if (user_name === undefined || user_name === '') {
        cb(undefined, 'Must specify the user name of the new user');
    } else if (password === undefined ||  password === '') {
        cb(undefined, 'Must specify the password of the new user');
    } else if (email_address === undefined || email_address === '') {
        cb(undefined, 'Must provide an email address of the new user');
    } else if (user_type === undefined || isNaN(parseInt(user_type))) {
        cb(undefined, 'Must provide a user type');
    } else {
        encrypt_password();
    }

    function encrypt_password () {
        bcrypt.genSalt(work_factor, function (err, salt) {
            if (err) {
                cb(undefined, 'Error generating salt for password encryption: ' + err);
            } else {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        cb(undefined, 'Error encrypting password: ' + err);
                    } else {
                        insert_data(hash);
                    }
                });
            }
        });
    }

    function insert_data (pw_hash) {
        credentials.zora_query('INSERT INTO User (user_name, name, pass_hash, email_address, user_type) '
        + 'VALUES (?, ?, ?, ?, ?);', [user_name, name, pw_hash, email_address, user_type], function (err) {
            if (err) {
                cb(undefined, 'MYSQL error: ' + err);
            } else {
                cb(true);
            }
        });
    }
};

exports.removeUser = function (userID, cb) {
    if (userID === undefined || isNaN(parseInt(userID))) {
        cb(undefined, 'Must provide a valid user ID');
    } else {
        credentials.zora_query('DELETE FROM User WHERE id = ? LIMIT 1;', [userID],
            function (err) {
                if (err) {
                    cb(undefined, 'MYSQL error: ' + err);
                } else {
                    cb(true);
                }
            }
        );
    }
};

exports.getUserTypes = function (cb) {
    credentials.zora_query('SELECT ut.id, ut.name FROM UserType AS ut;', [], function (err, res) {
        if (err) {
            cb(undefined, 'MYSQL error: ' + err);
        } else {
            cb(res);
        }
    });
};