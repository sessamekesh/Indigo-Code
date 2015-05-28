/**
 * Created by Kamaron on 4/22/2015.
 */

// TODO KIP: Implement a User and Team object that you can use, instead of
//  this on-the-fly stuff you're doing now

'use strict';

var bcrypt = require('bcrypt');
var db = require('./db');

/**
 * Work factor in computing password hashes.
 * @type {number}
 */
var work_factor = 10;

/**
 * Information about a user, in standard form for the rest of the competition.
 * @param id {number} User ID, unique ID used to reference that user
 * @param username {string} Unique name used for that user, what should be used on public facing data
 * @param is_admin {boolean} True if the user is allowed into general admin functionality
 * @param public_facing {boolean} True if the user wants to be publicly shown (a profile)
 * @param first_name {string} First name of user. Not publicly visible.
 * @param last_name {string} Last name of user. Not publicly visible.
 * @param email_address {string} Email address of user. Not publicly visible.
 * @constructor
 */
exports.UserData = function (id, username, is_admin, public_facing, first_name, last_name, email_address) {
    this.id = id;
    this.username = username;
    this.is_admin = !!is_admin;
    this.public_facing = !!public_facing;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email_address = email_address;
};

/**
 * Is the UserData object complete with everything? Essentially, are all the fields non-null?
 * @return {boolean}
 */
exports.UserData.prototype.isCompleteForEntry = function () {
    return !!this.username && (this.is_admin === true || this.is_admin === false)
        && (this.public_facing === true || this.public_facing === false) && !!this.first_name && !!this.last_name
        && !!this.email_address;
};

/**
 * Fill up data about a team, and the users which are on it.
 * @param id {number} ID of team
 * @param comp_id {number} ID of competition for to which the team belongs
 * @param team_name {string} Name of the team. Must be unique among the team names in the given competition
 * @param team_tagline {string} Tagline of the team. Trust me, you want to provide a tagline.
 * @param is_admin {boolean} Is this an admin team? Admin teams cannot compete, but they can access the competition
 *                              before it begins, add problems, test cases, etc.
 * @param public_code {boolean} Does this team provide its code to other users after the competition?
 * @param user_ids {Array<number>} List of user IDs of the users on this team
 * @constructor
 */
exports.TeamData = function (id, comp_id, team_name, team_tagline, is_admin, public_code, user_ids) {
    this.id = id;
    this.comp_id = comp_id;
    this.team_name = team_name;
    this.team_tagline = team_tagline || ''; // Optional parameter
    this.is_admin = (is_admin == null) ? false : !!is_admin;
    this.public_code = (public_code == null) ? true : !!public_code;
    this.user_ids = user_ids || [];
};

/**
 * @param username {string}
 * @param cb {function}
 */
exports.checkUserExists = function (username, cb) {
    if (!username || username === '') {
        cb(new Error('No user information provided!'));
    } else {
        db.owl_query('SELECT id FROM user WHERE username = ?;', username, function (err, res) {
            if (err) {
                cb (err);
            } else {
                cb (res.length > 0);
            }
        });
    }
};

/**
 * Authenticate a user that exists in the database
 * @param username {string}
 * @param password {string}
 * @param cb
 */
exports.authUser = function (username, password, cb) {
    if (!username || username === '') {
        cb(new Error('No username provided'));
    } else if (!password || password === '') {
        cb(new Error('No password provided'));
    } else {
        db.owl_query('SELECT pass_hash FROM user WHERE username = ?;', username, function (err, res) {
            if (err) {
                cb(err);
            } else if (res.length !== 1) {
                cb(new Error('User not found!'));
            } else {
                bcrypt.compare(password, res[0].pass_hash, function (aerr, ares) {
                    if (aerr) {
                        cb(aerr);
                    } else if (!ares) {
                        cb(new Error('Wrong password'));
                    } else {
                        exports.getUserByUsername(username, true, cb);
                    }
                });
            }
        });
    }
};

/**
 * Gets data about the user with the given username
 * @param username {string}
 * @param sensitive {boolean} True if only public-facing data about the user is to be exposed
 * @param cb{function}
 */
exports.getUserByUsername = function (username, sensitive, cb) {
    if (!username || username === '') {
        cb(new Error('Must provide user name'));
    } else if (sensitive === true) {
        db.owl_query('SELECT id, is_admin, username, public_facing FROM user WHERE username=?;', [username], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user not found'));
                } else {
                    cb(null, new exports.UserData(
                        res[0].id,
                        res[0].username,
                        res[0].is_admin[0],
                        res[0].public_facing[0],
                        null, null, null
                    ));
                }
            }
        });
    } else {
        db.owl_query('SELECT id, first_name, last_name, username, email_address, is_admin, public_facing, pass_hash FROM user WHERE username=?;', [username], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user was not found'));
                } else {
                    cb(null, new exports.UserData(
                        res[0].id,
                        res[0].username,
                        res[0].is_admin,
                        res[0].public_facing,
                        res[0].first_name,
                        res[0].last_name,
                        res[0].email_address
                    ));
                }
            }
        });
    }
};

/**
 * Gets information about the user with the given user ID
 * @param user_id {number} User ID of user to retrieve
 * @param sensitive {boolean} True if only public-facing data about the user is to be returned
 * @param cb {function}
 */
exports.getUserById = function (user_id, sensitive, cb) {
    if (isNaN(parseInt(user_id))) {
        cb(new Error('Must provide user ID!'));
    } else if (sensitive === true) {
        db.owl_query('SELECT id, username, is_admin, public_facing FROM user WHERE id = ?;', [user_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user not found!'));
                } else {
                    cb(null, new exports.UserData(
                        res[0].id,
                        res[0].username,
                        res[0].is_admin,
                        res[0].public_facing,
                        null, null, null
                    ));
                }
            }
        });
    } else {
        db.owl_query('SELECT id, name, username, email_address, is_admin, pass_hash FROM user WHERE id=?;', [user_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user was not found'));
                } else {
                    cb(null, new exports.UserData(
                        res[0].id,
                        res[0].username,
                        res[0].is_admin,
                        res[0].public_facing,
                        res[0].first_name,
                        res[0].last_name,
                        res[0].email_address
                    ));
                }
            }
        });
    }
};

/**
 * Add a new user to the database
 * @param user_data {exports.UserData} Data about the user (except password)
 * @param password {string} Password the new user wants
 * @param cb {function} Callback, with error, result
 */
exports.addUser = function (user_data, password, cb) {
    if (!user_data.isCompleteForEntry()) {
        cb(new Error('User data is incomplete, please submit complete user_data object'));
    } else if (!password) {
        cb(new Error('Must provide new password'));
    } else {
        bcrypt.genSalt(work_factor, function (err, salt) {
            if (err) {
                cb(err);
            } else {
                bcrypt.hash(password, salt, function (aerr, hash) {
                    db.owl_query('INSERT INTO user (first_name, last_name, username, pass_hash, email_address, is_admin, public_facing) '
                        + 'VALUES(?, ?, ?, ?, ?, ?, ?);',
                        [user_data.first_name, user_data.last_name, user_data.username, hash,
                        user_data.email_address, user_data.is_admin, user_data.public_facing], function (berr, res) {
                            if (berr) {
                                cb(berr);
                            } else {
                                // On success, return the user information that is not sensitive (login data)
                                cb(null, new exports.UserData(res.insertId,
                                    user_data.username, user_data.is_admin, user_data.public_facing,
                                null, null, null));
                            }
                        }
                    );
                });
            }
        });
    }
};

/**
 * Retrieves the team data of the team to which a user belongs for a given competition
 * @param user_id {number} ID of user in question
 * @param comp_id {number} ID of the competition in question
 * @param sensitive {boolean} True if only public facing data is to be returned
 * @param cb {function(err: Error=, exports.TeamData=)}
 */
exports.getTeamOfUser = function (user_id, comp_id, sensitive, cb) {
    if (isNaN(parseInt(user_id))) {
        cb(new Error('Must provide a valid integer user ID!'));
    } else if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide a valid integer competition ID!'));
    } else if (true || sensitive === true) {
        // This may be changed, if I decide there is sensitive data in a team. I don't think there is.
        db.owl_query('SELECT team.id, team.comp_id, team.name, team.tagline, team.is_admin, team.public_code '
            + 'FROM user_team LEFT JOIN team ON team.id = user_team.team_id '
            + 'WHERE user_team.user_id = ? AND team.comp_id = ?;',
            [user_id, comp_id],
            function (err, res) {
                if (err) {
                    cb(err);
                } else if (res.length === 0) {
                    cb();
                } else {
                    // Grab user data...
                    db.owl_query('SELECT user_id FROM user_team WHERE team_id = ?;', [res.id], function (aerr, ares) {
                        if (aerr) {
                            cb(err);
                        } else {
                            cb(null, new exports.TeamData(
                                res[0].id,
                                res[0].comp_id,
                                res[0].name,
                                res[0].team_tagline,
                                res[0].is_admin,
                                res[0].public_code,
                                ares.map(function (a) { return a.user_id })
                            ));
                        }
                    });
                }
            }
        );
    }
};

/**
 * Creates a team with the provided information. All users must already exist in the database.
 * @param team_data {exports.TeamData} Data of the team to insert
 * @param cb {function}
 */
exports.create_team = function (team_data, cb) {
    if (isNaN(parseInt(team_data.comp_id))) {
        cb(new Error('Must provide an integer competition ID'));
    } else if (!team_data.team_name || team_data.team_name === '') {
        cb(new Error('Team name cannot be empty'));
    } else if (Object.prototype.toString.call(team_data.user_ids) !== '[object Array]' || team_data.user_ids.length === 0) {
        cb(new Error('Must give array of user IDs with at least one entry'));
    } else {
        // Begin our long process of validation and whatnot
        // TODO KIP: This isn't an elegant way to chain validation, make it a list of functions instead.
        validateUsers(function () {
            validateUserCount(function () {
                createTeam();
            });
        });
    }

    // --- Validations for team entries, to be used by this function ---
    /**
     * Determine if all the users in the given user_id_list indeed exist in the table
     * @param vucb {function} The next function to call in line, on success. Parameters: none
     */
    function validateUsers(vucb) {

        validateIndividualUser(0);

        /**
         * Validates an individual user, at position i in user_id_list, or calls cb for early out if invalid
         * @param i {number} Index in user_id_list at which to check the corresponding user for database existance
         */
        function validateIndividualUser(i) {
            if (i >= team_data.user_ids.length) {
                // Made it through all of them? Success!
                vucb();
            } else {
                db.owl_query('SELECT COUNT(*) AS user_count FROM user WHERE id = ?;', [team_data.user_ids[i]], function (err, res) {
                    if (err) {
                        // Apparently the user doesn't exist, or malformed query - get out here.
                        cb(err);
                    } else {
                        if (!res[0] || !res[0].user_count || res[0].user_count < 1) {
                            cb(new Error('Invalid user ID: ' + team_data.user_ids[i]));
                        } else {
                            validateIndividualUser(i + 1);
                        }
                    }
                });
            }
        }
    }

    /**
     * Validate that the number of users included in user_id_list is within the range acceptable
     *  to this particular competition
     * @param vuccb {function} The next function to call in line, on success. Parameters: none
     */
    function validateUserCount(vuccb){
        db.owl_query('SELECT max_team_size FROM competition WHERE id = ?;', [team_data.comp_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (res[0].max_team_size < team_data.user_ids.length) {
                    cb(new Error('Too many users on the team - this competition has a maximum team size of ' + res[0].max_team_size));
                } else {
                    vuccb();
                }
            }
        });
    }

    /**
     * Function to be called last, after all validation. This performs the actual insertion, and
     *  returns the team data
     */
    function createTeam() {
        db.owl_query('INSERT INTO team (comp_id, name, tagline, is_admin, public_code) VALUES (?, ? ,?, ?, ?);',
            [team_data.comp_id, team_data.team_name, team_data.team_tagline, team_data.is_admin, team_data.public_code],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    createUserTeamEntry(new exports.TeamData(
                        res.insertId,
                        team_data.comp_id,
                        team_data.team_name,
                        team_data.team_tagline,
                        team_data.is_admin,
                        team_data.public_code,
                        team_data.user_ids
                    ), 0);
                }
            }
        );
    }

    /**
     * Create a userteam entry for the given team, with the given user ID
     * @param team_data {exports.TeamData} Team data to be returned, also useful for having team ID included, required for inserts
     * @param i {number} Index of user_id_list corresponding to the user id to add to the team
     */
    function createUserTeamEntry(team_data, i) {
        if (i >= team_data.user_ids.length) {
            cb(null, team_data);
        } else {
            db.owl_query('INSERT INTO user_team (user_id, team_id) VALUES (?, ?);',
                [team_data.user_ids[i], team_data.id],
                function (err) {
                    if (err) {
                        // In addition to sending out error message, also undo all actions involved
                        //  in creating the team
                        cb(err);
                        undoUserTeamEntriesAndTeamCreation(team_data);
                    } else {
                        createUserTeamEntry(team_data, i + 1);
                    }
                }
            );
        }
    }

    /**
     * Undo the fuck-up you did earlier in inserting data into the database
     *  Callback is not invoked at this point, the fail message has already been sent back
     * @param team_data {object} Data of team created, useful mostly for having ID
     */
    function undoUserTeamEntriesAndTeamCreation(team_data) {
        // Step one: remove user team entries
        // TODO KIP: I'm a little nervous about the security here, add a limit clause perhaps?
        db.owl_query('DELETE FROM userteam WHERE team_id = ?;', [team_data.id], function (err) {
            if (err) {
                console.log('user_dao[create_team][undoUserTeamEntriesAndTeamCreation]: An error occurred deleting userteam entries: ' + err.message);
            }
            db.owl_query('DELETE FROM team WHERE id = ?;', [team_data.id], function (aerr) {
                if (aerr) {
                    console.log('user_dao[create_team][undoUserTeamEntriesAndTeamCreation]: An error occurred deleting the team: ' + err.message);
                }
            });
        });
    }
};

/**
 * Removes a user from the database
 * @param user_id {number} The ID of the user to be removed from the database
 * @param cb {function}
 */
exports.remove_user = function (user_id, cb) {
    if (isNaN(parseInt(user_id))) {
        cb(new Error('Must provide a user ID to remove from the database!'));
    } else {
        db.owl_query('DELETE FROM user WHERE id = ? LIMIT 1;', [user_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                cb(null, res);
            }
        });
    }
};

// TODO KIP: Do this.
exports.remove_team = function (team_id, cb) {

};

// TODO KIP: Do this.
exports.remove_user_from_team = function (user_id, team_id, cb) {

};

// TODO KIP: Do this.
exports.remove_user_from_competition = function (user_id, comp_id, cb) {

};