/**
 * Created by kamaron on 4/8/15.
 */

var url = require('url'),
    competition_dao = require('../../dao/competition_dao'),
    user_dao = require('../../dao/user_dao'),
    team_dao = require('../../dao/team_dao');

exports.register_team = function (req, res) {
    "use strict";

    var req_params = ((Object.keys(req.body).length > 0) ? req.body : req.query) || {};

    // Search for all required params...
    var err_list = [];
    if (req_params.team_name === undefined || req_params.team_name === '') {
        err_list.push({ param: 'team_name', error: 'Must provide a team name' });
    }
    if (req_params.comp_id === undefined || isNaN(parseInt(req_params.comp_id))) {
        err_list.push({ param: 'general', error: 'Must provide a competition ID' });
    }
    if (req_params.team_tagline === undefined) {
        req_params.team_tagline = '';
    }
    if (req_params.team_notes === undefined) {
        req_params.team_notes = '';
    }

    // Get team size, make sure we have that number of things accounted for,
    //  no more, no less.
    competition_dao.getCompetitionData(req_params.comp_id, function (rsl, err) {
        if (err) {
            err_list.push({ param: 'general', error: 'Could not fetch data for competition ' + req_params.comp_id });
            console.log('api.js: Error fetching competition ' + req_params.comp_id + ' - ' + err);
            end_error();
        } else {
            check_users(rsl.max_team_size);
        }
    });

    function check_users(n_users) {
        console.log('Checking existence of ' + n_users + ' users...');
        if ((req_params.user_data || []).length !== n_users) {
            err_list.push({ param: 'general', error: 'Competition does not call for ' + req_params.user_data.length + ' registrations - re-send data with ' + n_users + ' user data entries.' });
            end_error();
        } else {
            // Validate user types...
            // User 1 cannot be blank
            if (req_params.user_data[0].type !== 'new' && req_params.user_data[0].type !== 'existing') {
                err_list.push({ param: 'usertype[0]', error: 'User 1 cannot be blank - must be new or existing user.' })
            }

            check_user(n_users, 0);
        }
    }

    function check_user(n_users, i, existing_users) {
        if (existing_users === undefined) {
            existing_users = [];
        }
        if (i >= n_users) {
            if (err_list.length > 0) {
                end_error();
            } else {
                attempt_register_team();
            }
        } else {
            var udat = req_params.user_data[i].data;
            console.log(udat);
            if (req_params.user_data[i].type === 'new') {
                // Check user data params, make sure all required fields are present...
                // Check to see if username is already taken...
                // User will not be created now - it will be created after the
                //  team is successfully created. The team will be removed
                //  if a user actually fails to be created after the fact,
                //  along with successfully created users.

                if (udat.username === undefined || udat.username === '') {
                    err_list.push({ param: 'user_data[' + i + '].data.username', error: 'Must provide user name' });
                }
                if (udat.name === undefined || udat.name === '') {
                    err_list.push({ param: 'user_data[' + i + '].data.name', error: 'Must provide name of user' });
                }
                if (udat.pass === undefined || udat.pass === '') {
                    err_list.push({ param: 'user_data[' + i + '].data.pass', error: 'Must provide a password'});
                }
                if (udat.confirm_pass === undefined || udat.confirm_pass === '' || udat.confirm_pass !== udat.pass) {
                    err_list.push({ param: 'user_data[' + i + '].data.confirm_pass', error: 'Must provide a confirmation password that matches the password'});
                }
                if (udat.email === undefined || udat.email === '') {
                    // TODO KIP: Add email regex
                    err_list.push({ param: 'user_data[' + i + '].data.email', error: 'Must provide a valid email address' });
                }
                if (udat.selected_user_type === undefined || isNaN(parseInt(udat.selected_user_type))) {
                    err_list.push({ param: 'user_data[' + i + '].data.selected_user_type', error: 'Must provide a valid user type (by ID)'});
                }

                // Check to see if user was already added...
                for (var idx = 0; idx < existing_users.length; idx++) {
                    if (existing_users[idx] === udat.username) {
                        err_list.push({ param: 'user_data[' + i + '].data.username', error: 'Username ' + udat.username + ' was already used previously in form' });
                    }
                }

                // Fields check the pre-test, advance to next user.
                existing_users.push(udat.username);
                check_user(n_users, i + 1, existing_users);
            } else if (req_params.user_data[i].type === 'existing') {
                // Since no data is being written, we can authenticate the user right now...
                if (udat.username === undefined || udat.username === '') {
                    err_list.push({ param: 'user_data[' + i + '].data.username', error: 'Must provide a username for user ' + (i + 1) });
                }
                if (udat.pass === undefined || udat.pass === '') {
                    err_list.push({ param: 'user_data[' + i + '].data.pass', error: 'Must provide a password for user ' + (i + 1)});
                }

                // Check to see if user was already added...
                for (var idx = 0; idx < existing_users.length; idx++) {
                    if (existing_users[idx] === udat.username) {
                        err_list.push({ param: 'user_data[' + i + '].data.username', error: 'Username ' + udat.username + ' was already used previously in form' });
                    }
                }

                existing_users.push(udat.username);

                user_dao.authUser(udat.username, udat.pass, function (rsl, err) {
                    if (err || !rsl) {
                        err_list.push({ param: 'user_data[' + i + '].data.pass', error: 'Incorrect username or password' });
                    }

                    check_user(n_users, i + 1, existing_users);
                });
            } else if (req_params.user_data[i].type === 'blank') {
                check_user(n_users, i + 1, existing_users);
            } else {
                err_list.push({ param: 'user_data[' + i + '].type', error: 'Unrecognized user type "' + req_params.user_data[i].type + '"' });
                check_user(n_users, i + 1, existing_users);
            }
        }
    }

    function attempt_register_team() {
        // Attempt to create a new team registration - be sure to note the team ID, because we will be removing
        //  the entry if a new user fails.

        team_dao.addTeam(req_params.team_name, req_params.team_tagline, req_params.comp_id, req_params.team_notes, function (rsl, err) {
            // TODO KIP: Wouldn't it be great if you had an error logging module that did better levels of error reporting?
            if (err) {
                // TODO KIP: Improve MySQL error handling on these, right now it's awful.
                console.log('team_api.js: Error registering team - ' + JSON.stringify(err));
                if (err.indexOf('ER_DUP_ENTRY') > 0) {
                    err_list.push({ param: 'team_name', error: 'Team name ' + req_params.team_name + ' is already taken' });
                } else {
                    err_list.push({ param: 'generic', error: 'Unknown error registering team - system administrater has been notified of error'});
                }
                end_error();
            } else {
                create_new_users_and_entries(rsl);
            }
        });
    }

    function create_new_users_and_entries (teamID, user_index, created_users) {
        created_users = created_users || [];

        if (user_index === undefined) {
            user_index = 0;
        }

        if (user_index >= req_params.user_data.length) {
            end_success(teamID);
        } else {
            var user_data = req_params.user_data[user_index];
            if (user_data.type === 'new') {
                // Create user, mark ID for possible later removal, or addition to teams
                //  if team creation was success
                user_dao.addUser(user_data.data.name, user_data.data.username, user_data.data.pass, user_data.data.email, user_data.data.selected_user_type, function (rsl, err) {
                    if (err) {
                        console.log('team_api.js: Error inserting new user ' + user_data.data.username + ': ' + err);
                        err_list.push({ param: 'generic', error: 'Could not add user ' + user_data.data.username + ' to system - failure reason has been reported to system administrator.' });
                        cleanup_failure(teamID, created_users);
                    } else {
                        created_users.push(rsl);
                        team_dao.addUserToTeam(rsl, teamID, function (trsl, err) {
                            if (err) {
                                console.log('team_api.js: Error inserting user ' + user_data.data.username + ' to team - ' + err);
                                err_list.push({ param: 'generic', error: 'Could not add newly created user ' + user_data.data.username + ' to team - failure reason has been reported to system administrator.' });
                                cleanup_failure(teamID, created_users);
                            } else {
                                create_new_users_and_entries(teamID, user_index + 1, created_users);
                            }
                        });
                    }
                });
            } else if (user_data.type === 'existing') {
                // User has already been authenticated - grab user ID, no additional work required
                user_dao.getUserData(user_data.data.username, user_data.data.pass, function (rsl, err) {
                    if (err) {
                        console.log('team_api.js: Error retrieving user ID for user ' + user_data.data.username + ' - ' + err);
                        err_list.push({ param: 'generic', error: 'Could not get data for user ' + user_data.data.username + ' - failure reason has been reported to system administrator.' });
                        cleanup_failure(teamID, created_users);
                    } else {
                        team_dao.addUserToTeam(rsl, teamID, function (trsl, err) {
                            if (err) {
                                console.log('team_api.js: Error inserting user ' + user_data.data.username + ' to team - ' + err);
                                err_list.push({ param: 'generic', error: 'Could not add existing user ' + user_data.data.username + ' to team - failure reason has been reported to system administrator.' });
                                cleanup_failure(teamID, created_users);
                            } else {
                                create_new_users_and_entries(teamID, user_index + 1, created_users);
                            }
                        });
                    }
                });
            } else if (user_data.type === 'blank') {
                // No user is required, yeah
                create_new_users_and_entries(teamID, user_index + 1, created_users);
            }
        }
    }

    function cleanup_failure (teamID, created_users) {
        // Remove team from table, as well as created user IDs,
        //  and report a failure.
        // We do not have to notify user of successful removal of users - if a failure occurs, log it.
        end_error();

        for (var i = 0; i < created_users.length; i++) {
            user_dao.removeUser(created_users[i], function (rsl, err) {
                if (err) {
                    console.log('team_api.js: Error removing newly created user ' + created_users[i] + ' - ' + err);
                }
            });
        }

        team_dao.removeTeam(teamID, function (rsl, err) {
            if (err) {
                console.log('team_api.js: Error removing newly created team ' + teamID + ' - ' + err);
            }
        });
    }



    function end_success(teamid) {
        if (err_list.length > 0) {
            end_error();
        } else {
            res.send({ 'success': true, team_id: teamid });
        }
    }

    function end_error() {
        res.status(400).send({'success': false, 'error': req.url, 'message': 'One or more errors occurred processing your request', 'error_list': err_list});
    }

    console.log('Registering new team...');
    console.log(req_params);
};

