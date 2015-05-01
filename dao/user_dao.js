/**
 * Created by Kamaron on 4/22/2015.
 */

var MongoClient = require('mongodb').MongoClient,
    connection_settings = require('./connection_settings'),
    counters = require('./counters'),
    bcrypt = require('bcrypt'),
    work_factor = 10;

/**
 * A method provided to external code that allows the caller to insert a new
 *  user record
 * @param username The username of the new user to insert (must be unique)
 * @param password The password of the new user to insert (is encrypted with bcrypt library, not stored plaintext)
 * @param email The email address of the new user to insert
 * @param is_admin True for admin, false otherwise. Determines if user is, by default, an admin to competitions
 * @param cb Callback on success or fail - formed as such: callback(err, new_user_id)
 */
exports.create_new_user = function (username, password, email, is_admin, cb) {
    if (username === undefined || username === '') {
        cb('Must provide username');
    } else if (password === undefined || password === '') {
        cb('Must provide password');
    } else if (email === undefined || email === '') {
        cb('Must provide email');
    } else if (is_admin === undefined || (is_admin !== true && is_admin !== false)) {
        cb('Must provide boolean is_admin');
    } else {
        // Make sure username does not already exist
        MongoClient.connect(connection_settings.url, function (err, db) {
            if (err) {
                db.close();
                cb(err);
            } else {
                var collection = db.collection('user_data');
                // Make sure there is no user with the given username already
                collection.find({ username: username }, function (aerr, aresults) {
                    if (aerr) {
                        db.close();
                        cb(aerr);
                    } else {
                        if (aresults.length !== 0) {
                            db.close();
                            cb('Username ' + username + ' is already taken');
                        } else {
                            counters.get_next_user_id(function (berr, uid) {
                                if (berr) {
                                    db.close();
                                    cb(berr);
                                } else {
                                    // Generate salt for encryption...
                                    bcrypt.genSalt(work_factor, function (cerr, salt) {
                                        if (cerr) {
                                            cb(cerr);
                                        } else {
                                            bcrypt.hash(password, salt, function (derr, hash) {
                                                if (derr) {
                                                    cb(derr);
                                                } else {
                                                    collection.insertOne({
                                                        user_id: uid,
                                                        username: username,
                                                        pass_hash: hash,
                                                        email: email,
                                                        is_admin: is_admin
                                                    }, function (eerr, cres) {
                                                        if (eerr) {
                                                            db.close();
                                                            cb(eerr);
                                                        } else {
                                                            console.log('To sate my curiosity, the result is ' + cres);
                                                            db.close();
                                                            cb(uid);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    }
};

exports.get_user_data = function (user_id, cb) {
    if (user_id === undefined || isNaN(parseInt(user_id))) {
        cb('No valid user ID provided!');
    } else {
        MongoClient.connect(connection_settings.url, function (err, db) {
            if (err) {
                db.close();
                cb(err);
            } else {
                var collection = db.collection('user_data');
                collection.find({ user_id: user_id }).toArray(function (aerr, aresults) {
                    if (aerr) {
                        db.close();
                        cb(aerr);
                    } else {
                        if (aresults.length === 0) {
                            db.close();
                            cb();
                        } else {
                            db.close();
                            cb(aresults[0]);
                        }
                    }
                });
            }
        });
    }
};

exports.get_user_by_username = function (username, cb) {
    if (username === 'sessamekesh') {
        cb(null, {
            user_id: 0,
            username: 'sessamekesh',
            pass_hash: 'asdf',
            email_address: 'kam.is.amazing@gmail.com',
            is_admin: true
        });
    } else {
        cb('User ' + username + ' does not exist!', undefined);
    }
};

exports.authenticate_user = function (username, password, cb) {
    if (username === 'sessamekesh' && password === 'asdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};