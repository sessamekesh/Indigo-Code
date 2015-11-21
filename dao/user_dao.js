/**
 * Created by Kamaron on 4/22/2015.
 */

// TODO KIP: Implement a User and Team object that you can use, instead of
//  this on-the-fly stuff you're doing now

'use strict';

var bcrypt = require('bcrypt');
var db = require('./db');

var CompData = require('./competition_dao').CompData;

/**
 * Work factor in computing password hashes.
 * @type {number}
 */
var work_factor = 10;

exports.ADMIN_TEAM_DOES_NOT_EXIST_ERROR = 'No administrative team found';
exports.USERNAME_NOT_FOUND = 'No user by that name found';
exports.DELETION_FROM_ADMIN_TEAM_FAILED = 'Failed to delete user from admin team';
exports.NO_USER_PARTICIPATION_FOUND = 'The user provided has not participated in any coding competitions';
exports.USER_ID_NOT_FOUND = 'No user with the given ID found';

exports.USER_FIELDS = {
    ID: 'id',
    FIRST_NAME: 'first_name',
    LAST_NAME: 'last_name',
    USERNAME: 'username',
    EMAIL_ADDRESS: 'email_address',
    IS_ADMIN: 'is_admin',
    PUBLIC_FACING: 'public_facing'
};

/**
 * Information about a user, in standard form for the rest of the competition.
 * @param id {number} User ID, unique ID used to reference that user
 * @param username {string} Unique name used for that user, what should be used on public facing data
 * @param is_admin {boolean} True if the user is allowed into general admin functionality
 * @param public_facing {boolean} True if the user wants to be publicly shown (a profile)
 * @param first_name {string=} First name of user. Not publicly visible.
 * @param last_name {string=} Last name of user. Not publicly visible.
 * @param email_address {string=} Email address of user. Not publicly visible.
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
 * UserParticipation object - holds information about a user's participation in competitions.
 * @param userData {exports.UserData}
 * @param compData {CompData}
 * @param teamData {exports.TeamData}
 * @constructor
 */
exports.UserParticipation = function(userData, compData, teamData) {
    this.userData = userData;
    this.compData = compData;
    this.teamData = teamData;
};

/**
 * Fill up data about a team, and the users which are on it.
 * @param id {number} ID of team
 * @param comp_id {number} ID of competition for to which the team belongs
 * @param team_name {string} Name of the team. Must be unique among the team names in the given competition
 * @param team_tagline {string} Tagline of the team. Trust me, you want to provide a tagline.
 * @param is_admin {boolean} Is this an admin team? Admin teams cannot compete, but they can access the competition
 *                              before it begins, add problem, test cases, etc.
 * @param public_code {boolean} Does this team provide its code to other users after the competition?
 * @param user_ids {Array<number>} List of user IDs of the users on this team
 * @param score {number} The score of this team
 * @param time_penalty {number} The time penalty this team has accrued
 * @constructor
 */
exports.TeamData = function (id, comp_id, team_name, team_tagline, is_admin, public_code, user_ids, score, time_penalty) {
    this.id = id;
    this.comp_id = comp_id;
    this.team_name = team_name;
    this.team_tagline = team_tagline || ''; // Optional parameter
    this.is_admin = (is_admin == null) ? false : !!is_admin;
    this.public_code = (public_code == null) ? true : !!public_code;
    this.user_ids = user_ids || [];

    this.score = score || 0;
    this.time_penalty = time_penalty || 0;
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
                    cb(new Error(exports.USER_ID_NOT_FOUND));
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
        db.owl_query('SELECT id, first_name, last_name, username, email_address, is_admin, pass_hash FROM user WHERE id=?;', [user_id], function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!res || res.length === 0) {
                    cb(new Error(exports.USER_ID_NOT_FOUND));
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
 * Used by administrators. Returns all users in the database, sorted on a given field (if provided)
 *  Options:
 *  - sensitive: True if the response is sensitive, i.e., if you only want to include non-sensitive data. Default: false
 *  - sort_by: Column on which to sort the data. Default: exports.USER_FIELDS.USERNAME
 *  - sort_ascending: True to sort ascending, false to sort descending. Default: true
 * @param options {object=} Optional options for this call
 * @param cb {function(Error=, Array<exports.UserData>=)} Callback on completion of method
 */
exports.getAllUsers = function (options, cb) {
    // Establish options...
    options = options || {};
    options.sensitive = !!options.sensitive;
    options.sort_ascending = options.sort_ascending === undefined ? true : !!options.sort_ascending;
    // TODO HANSY: I know this is grunt work code maintenance, but originally I made this whole thing long. I only really need the else condition, make it... shorter...
    if (options.sort_by === exports.USER_FIELDS.EMAIL_ADDRESS) {
    } else if (options.sort_by === exports.USER_FIELDS.FIRST_NAME) {
    } else if (options.sort_by === exports.USER_FIELDS.LAST_NAME) {
    } else if (options.sort_by === exports.USER_FIELDS.ID) {
    } else if (options.sort_by === exports.USER_FIELDS.IS_ADMIN) {
    } else if (options.sort_by === exports.USER_FIELDS.PUBLIC_FACING) {
    } else if (options.sort_by === exports.USER_FIELDS.USERNAME) {
    } else {
        options.sort_by = exports.USER_FIELDS.USERNAME;
    }

    db.owl_query(
        'SELECT id, first_name, last_name, username, email_address, is_admin, public_facing '
        + 'FROM user ORDER BY ? ' + (options.sort_ascending ? 'ASC' : 'DESC'),
        [options.sort_by],
        function (err, res) {
            if (err) {
                cb(err);
            } else {
                cb(null, res.map(function (row) {
                    return new exports.UserData(
                        row.id,
                        row.username,
                        !!row.is_admin,
                        !!row.public_facing,
                        (options.sensitive || null) && row.first_name,
                        (options.sensitive || null) && row.last_name,
                        (options.sensitive || null) && row.email_address
                    )
                }));
            }
        }
    );
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
 * Retrieves information about the team with the given ID
 * @param team_id {number}
 * @param cb {function(err: Error=, exports.TeamData=)}
 */
exports.getTeam = function (team_id, cb) {
    if (isNaN(parseInt(team_id))) {
        cb(new Error('Must provide a valid integer team ID'));
    } else {
        db.owl_query('SELECT id, comp_id, name, tagline, is_admin, public_code, score, time_penalty FROM team WHERE id = ?;',
            [team_id],
            function (dberr, dbres) {
                if (dberr) {
                    cb(dberr);
                } else if (dbres.length === 0) {
                    cb(new Error('No team with given ID found'));
                } else {
                    cb(null, new exports.TeamData(
                        dbres[0].id, dbres[0].comp_id, dbres[0].name, dbres[0].tagline,
                        dbres[0].is_admin, dbres[0].public_code, dbres[0].score, dbres[0].time_penalty
                    ));
                }
            }
        );
    }
};

/**
 *
 * @param compId {number} Competition ID for which to get all teams
 * @param cb {function (err: Error=, Array.<TeamData>=)}
 */
exports.getTeamsInCompetition = function (compId, cb) {
    if (isNaN(parseInt(compId))) {
        cb(new Error('Could not get all teams in competition', compId, 'requires integer value'));
    } else {
        db.owl_query('SELECT id, comp_id, name, tagline, is_admin, public_code, score, time_penalty FROM team WHERE comp_id = ?;',
            [compId],
            function (dberr, dbres) {
                if (dberr) {
                    cb(dberr);
                } else {
                    //(id, name, start_date, end_date, time_penalty, max_team_size)
                    cb(null, dbres.map(function (row) {
                        return new exports.TeamData(
                            row['id'], row['comp_id'], row['name'],
                            row['tagline'], row['is_admin'], row['public_code'],
                            [], row['score'], row['time_penalty']
                        );
                    }));
                }
            }
        );
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
            + ', team.score, team.time_penalty '
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
                                res[0].tagline,
                                res[0].is_admin[0],
                                res[0].public_code,
                                ares.map(function (a) { return a.user_id }),
                                res[0].score,
                                res[0].time_penalty
                            ));
                        }
                    });
                }
            }
        );
    }
};

/**
 * For the competition with the given comp_id, fetches a list of all the users that are registered as
 *  admins for that team, or in other words, are on the admin team
 * @param comp_id {number} ID of the admin team
 * @param cb {function (Error=, Array<exports.UserData>=)} err for any errors, members is list of users
 *  on the admin team for this competition
 */
exports.getAdminTeamMembers = function (comp_id, cb) {
    if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide an integer competition ID'));
    } else {
        db.owl_query('SELECT user.id AS id, user.is_admin AS is_admin, user.username AS username, user.public_facing AS public_facing'
            + ' FROM user'
            + ' LEFT JOIN user_team ON user_team.user_id = user.id'
            + ' LEFT JOIN team ON team.id = user_team.team_id'
            + ' WHERE team.is_admin = 1 AND team.comp_id = ?;', [comp_id], function (err, res) {
            if (err) {
                cb(err);
            } else if (res.length === 0) {
                cb(new Error(exports.ADMIN_TEAM_DOES_NOT_EXIST_ERROR));
            } else {
                // TODO KIP: Modify
                cb(null, res.map(function (mySQL_result) {
                    return new exports.UserData(
                        mySQL_result.id,
                        mySQL_result.username,
                        mySQL_result.is_admin[0],
                        mySQL_result.public_facing
                    );
                }));
            }
        });
    }
};

/**
 * Promote a user to team administrator for a competition
 * @param comp_id {number}
 * @param username {string}
 * @param cb {function (Error=)}
 */
exports.addAdminToTeam = function (comp_id, username, cb) {
    if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide a valid competition ID'));
    } else if (!username) {
        cb(new Error('Must provide a valid username'));
    } else {
        exports.getUserByUsername(username, true, function (err, res) {
            if (err) {
                cb(err);
            } else if (!res) {
                cb(new Error(exports.USERNAME_NOT_FOUND));
            } else {
                db.owl_query('SELECT team.id AS id FROM team WHERE comp_id = ? AND is_admin = 1;', [comp_id],
                    function (aerr, ares) {
                        if (aerr) {
                            cb(aerr);
                        } else if (ares.length === 0) {
                            cb(new Error(exports.ADMIN_TEAM_DOES_NOT_EXIST_ERROR));
                        } else {
                            db.owl_query('INSERT INTO user_team (user_id, team_id) VALUES (? ,?);',
                                [res.id, ares[0].id],
                                function (cerr, cres) {
                                    if (cerr) {
                                        cb(cerr);
                                    } else {
                                        cb();
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    }
};

/**
 * Remove a competition administrator from the administrative team
 * @param comp_id {number}
 * @param user_id {number}
 * @param cb {function (Error=)}
 */
exports.removeAdminFromTeam = function (comp_id, user_id, cb) {
    if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide a valid integer competition ID'));
    } else if (isNaN(parseInt(user_id))) {
        cb(new Error('Must provide a valid integer user ID'));
    } else {
        db.owl_query('SELECT team.id AS id FROM team WHERE comp_id = ?;', [comp_id], function (err, res) {
            if (err) {
                cb(err);
            } else if (res.length === 0) {
                cb(new Error(exports.ADMIN_TEAM_DOES_NOT_EXIST_ERROR));
            } else {
                db.owl_query('DELETE FROM user_team WHERE user_id = ? AND team_id = ? LIMIT 1;', [user_id, res[0].id],
                    function (aerr, ares) {
                        if (aerr) {
                            cb(aerr);
                        } else if (res.affectedRows === 0) {
                            cb(new Error(exports.DELETION_FROM_ADMIN_TEAM_FAILED));
                        } else {
                            cb();
                        }
                    }
                );
            }
        });
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
                        team_data.user_ids,
                        0, 0
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

/**
 * Given a user ID, get what teams they have participated in, and which competitions.
 * @param userData {exports.UserData}
 * @param cb
 */
exports.getUserParticipation = function (userData, cb) {
    if (!userData) {
        cb(new Error('Must provide user data in order to get their participation information!'));
    } else {
        db.owl_query('SELECT c.id AS compID, c.name AS compName, c.start_date AS compStartDate, '
            + 'c.end_date AS compEndDate, c.max_team_size AS compMaxTeamSize, c.time_penalty AS compTimePenalty, '
            + 't.id AS teamID, t.name AS teamName, t.tagline AS teamTagline, t.is_admin AS teamIsAdmin, '
            + 't.public_code AS teamPublicCode, t.score AS teamScore, t.time_penalty AS teamTimePenalty '
            + 'FROM user_team LEFT JOIN team AS t ON user_team.team_id = t.id '
            + 'LEFT JOIN competition AS c ON c.id = t.comp_id WHERE user_team.user_id = ?;', [userData.id],
            function (err, res) {
                if (err) {
                    cb(err);
                } else if (res.length === 0) {
                    cb(new Error(exports.NO_USER_PARTICIPATION_FOUND));
                } else {
                    cb(null, res.map(function (row) {
                        return new exports.UserParticipation(
                            userData,
                            new CompData(
                                row.compID,
                                row.compName,
                                row.compStartDate,
                                row.compEndDate,
                                row.compTimePenalty,
                                row.compMaxTeamSize
                            ),
                            new exports.TeamData(
                                row.teamID,
                                row.compID,
                                row.teamName,
                                row.teamTagline,
                                row.teamIsAdmin,
                                row.teamPublicCode,
                                [], // TODO KAM: Really, should you have an empty array here?
                                row.teamScore,
                                t.teamTimePenalty
                            )
                        );
                    }));
                }
            }
        );
    }
};

/**
 * Delete a team from the database with the given ID
 * @param team_id
 * @param cb
 */
exports.remove_team = function (team_id, cb) {
    if (isNaN(team_id)) cb(new Error('Cannot delete a team if not given a team ID'));
    else db.owl_query('DELETE FROM team WHERE id = ? LIMIT 1;', [team_id], cb);
};

// TODO KIP: Do this.
exports.remove_user_from_team = function (user_id, team_id, cb) {

};

// TODO KIP: Do this.
exports.remove_user_from_competition = function (user_id, comp_id, cb) {

};