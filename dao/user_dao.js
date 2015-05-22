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
 * @param username {string}
 * @param cb {function}
 */
exports.checkUserExists = function (username, cb) {
    if (!username || username === '') {
        cb(new Error('No user information provided!'));
    } else {
        db.owl_query('SELECT id FROM user WHERE user_name = ?;', username, function (err, res) {
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
        db.owl_query('SELECT pass_hash FROM user WHERE user_name = ?;', username, function (err, res) {
            if (err) {
                cb(err);
            } else if (res.length !== 1) {
                cb(new Error('User not found!'));
            } else {
                bcrypt.compare(password, ph, function (aerr, ares) {
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
        db.owl_query('SELECT id, user_name, is_admin FROM user WHERE user_name=?;', [username], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user not found'));
                } else {
                    cb(null, res);
                }
            }
        });
    } else {
        db.owl_query('SELECT id, name, user_name, email_address, is_admin, pass_hash FROM user WHERE user_name=?;', [username], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user was not found'));
                } else {
                    cb(null, res);
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
        db.owl_query('SELECT id, user_name, is_admin FROM user WHERE id = ?;', [user_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user not found!'));
                } else {
                    cb(null, res);
                }
            }
        });
    } else {
        db.owl_query('SELECT id, name, user_name, email_address, is_admin, pass_hash FROM user WHERE id=?;', [user_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error('No results returned, user was not found'));
                } else {
                    cb(null, res);
                }
            }
        });
    }
};

/**
 * Method to add a user to the database
 * @param name {string} Actual name of user (e.g., 'Kamaron Peterson')
 * @param user_name {string} Desired name of user (e.g., 'Sessamekesh')
 * @param password {string} Password of user. Encrypted before entering into database.
 * @param email_address {string} Email address of user
 * @param is_admin {boolean} True if user is, by default, an admin in competitions. False otherwise
 * @param cb {function} callback (error, result)
 */
exports.addUser = function (name, user_name, password, email_address, is_admin, cb) {
    if (!name || name === '') {
        cb(new Error('Must provide a name for the user!'));
    } else if (!user_name || user_name === '') {
        cb(new Error('Must provide a username for the user!'));
    } else if (!password || password === '') {
        cb(new Error('Must provide a password for the user!'));
    } else if (!email_address || email_address === '') {
        cb(new Error('Must provide an email address for the user!'));
    } else if (is_admin === undefined ||is_admin === null || !(is_admin === true || is_admin === false)) {
        cb(new Error('Must provide a boolean true/false for is_admin field in user!'));
    } else {
        bcrypt.genSalt(work_factor, function (err, salt) {
            if (err) {
                cb(err);
            } else {
                bcrypt.hash(password, salt, function (aerr, hash) {
                    db.owl_query('INSERT INTO user (name, user_name, email_address, is_admin, pass_hash) VALUES (?, ?, ?, ?, ?);',
                        [name, user_name, email_address, is_admin, hash], function (berr, res) {
                            if (berr) {
                                cb(berr);
                            } else {
                                // On success, return the user information that is not sensitive (login data)
                                cb(null, {
                                    id: res.insertId,
                                    user_name: user_name,
                                    is_admin: is_admin
                                });
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
 * @param cb {function}
 */
exports.getTeamOfUser = function (user_id, comp_id, sensitive, cb) {
    if (isNaN(parseInt(user_id))) {
        cb(new Error('Must provide a valid integer user ID!'));
    } else if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide a valid integer competition ID!'));
    } else if (sensitive === true) {
        db.owl_query('SELECT team.id AS id, team.comp_id AS comp_id, team.team_name AS team_name, team.tagline AS team_tagline '
            + 'FROM userteam LEFT JOIN team ON team.id = userteam.team_id '
            + 'WHERE userteam.user_id = ? AND userteam.comp_id = ?;',
            [user_id, comp_id],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, {
                        id: res.id,
                        comp_id: res.comp_id,
                        team_name: res.team_name,
                        team_tagline: res.team_tagline,
                        is_admin: res.is_admin === 1
                    });
                }
            }
        );
    } else {
        db.owl_query('SELECT team.id AS id, team.comp_id AS comp_id, team.team_name AS team_name, team.tagline AS team_tagline, team.notes AS notes '
            + 'FROM userteam LEFT JOIN team ON team.id = userteam.team_id '
            + 'WHERE userteam.user_id = ? AND userteam.comp_id = ?;',
            [user_id, comp_id],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, {
                        id: res.id,
                        comp_id: res.comp_id,
                        team_name: res.team_name,
                        team_tagline: res.team_tagline,
                        is_admin: res.is_admin === 1,
                        team_notes: res.notes
                    });
                }
            }
        );
    }
};

/**
 * Creates a team with the provided information. All users must already exist in the database.
 * @param comp_id {number} Competition for which this team is being created
 * @param team_name {string} Desired team name, must be unique to teams in this competition
 * @param team_tagline {string} (optional) Desired team tagline
 * @param notes {string} (optional) Notes attached to this team, can be viewed by admins only
 * @param user_id_list {array[number]} Array of user IDs for users to include in this team
 * @param is_admin_team {boolean} (optional) True or false to specify admin status of team, null to default to highest
 *                      user status (i.e., admin if an admin user exists on team)
 * @param cb {function}
 */
exports.create_team = function (comp_id, team_name, team_tagline, notes, user_id_list, is_admin_team, cb) {
    // Optional parameters, set empty if not included
    if (!team_tagline) {
        team_tagline = '';
    }

    if (!notes) {
        notes = '';
    }

    if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide an integer competition ID'));
    } else if (!team_name || team_name === '') {
        cb(new Error('Team name cannot be empty'));
    } else if (Object.prototype.toString.call(user_id_list) !== '[object Array]' || user_id_list.length === 0) {
        cb(new Error('Must give array of user IDs with at least one entry'));
    } else {
        // Begin our long process of validation and whatnot
        // TODO KIP: This isn't an elegant way to chain validation, make it a list of functions instead.
        validateUsers(function () {
            findIsAdmin(function () {
                validateUserCount(function () {
                    createTeam();
                });
            });
        });
    }

    // --- Validations for team entries, to be used by this function ---
    /**
     * Determine if any user in the given user_id_list is indeed an admin
     * @param fiacb {function} The next function to call in line, on success. Parameters: none
     */
    function findIsAdmin(fiacb) {

        // Assume that no user is an admin, on find an admin, change this to true
        is_admin_team = false;

        // Start checking at the first user, see if they're an admin.
        isThisUserAnAdmin(0);

        /**
         * Determine if the user at position i in the array is indeed an admin
         * @param i {number} Index in the array at which to search
         */
        function isThisUserAnAdmin(i) {
            if (i >= user_id_list.length) {
                fiacb();
            } else {
                exports.getUserById(user_id_list[i], true, function (err, res) {
                    if (err) {
                        // This is not the user authenticating function, so if a user lookup fails,
                        //  just blow past it.
                        isThisUserAnAdmin(i + 1);
                    } else {
                        if (res.is_admin === true) {
                            is_admin_team = true;
                            fiacb();
                        } else {
                            isThisUserAnAdmin(i + 1);
                        }
                    }
                });
            }
        }
    }

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
            if (i >= user_id_list.length) {
                // Made it through all of them? Success!
                vucb();
            } else {
                db.owl_query('SELECT COUNT(*) AS user_count FROM user WHERE id = ?;', [user_id_list[i]], function (err, res) {
                    if (err) {
                        // Apparently the user doesn't exist, or malformed query - get out here.
                        cb(err);
                    } else {
                        if (!res[0] || !res[0].user_count || res[0].user_count < 1) {
                            cb(new Error('Invalid user ID: ' + user_id_list[i]));
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
        db.owl_query('SELECT max_team_size FROM competition WHERE id = ?;', [comp_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (res[0].max_team_size < user_id_list.length) {
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
        db.owl_query('INSERT INTO team (comp_id, team_name, tagline, notes, is_admin) VALUES (?, ? ,?, ?, ?);',
            [comp_id, team_name, team_tagline, notes, is_admin_team],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    createUserTeamEntry({
                        id: res.insertID,
                        comp_id: comp_id,
                        team_name: team_name,
                        team_tagline: team_tagline,
                        is_admin: is_admin_team
                    }, 0);
                }
            }
        );
    }

    /**
     * Create a userteam entry for the given team, with the given user ID
     * @param team_data {object} Team data to be returned, also useful for having team ID included, required for inserts
     * @param i {number} Index of user_id_list corresponding to the user id to add to the team
     */
    function createUserTeamEntry(team_data, i) {
        if (i >= user_id_list.length) {
            cb(null, {
                id: team_data.id,
                comp_id: team_data.comp_id,
                team_name: team_data.team_name,
                team_tagline: team_data.team_tagline,
                is_admin: team_data.is_admin
            });
        } else {
            db.owl_query('INSERT INTO userteam (team_id, user_id, comp_id) VALUES (?, ?, ?);',
                [team_data.team_id, user_id_list[i], team_data.comp_id],
                function (err, res) {
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
        db.owl_query('DELETE FROM userteam WHERE team_id = ?;', [team_data.id], function (err, res) {
            if (err) {
                console.log('user_dao[create_team][undoUserTeamEntriesAndTeamCreation]: An error occurred deleting userteam entries: ' + err.message);
            }
            db.owl_query('DELETE FROM team WHERE id = ?;', [team_data.id], function (aerr, ares) {
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