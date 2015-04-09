/**
 * Created by kamaron on 4/8/15.
 */

var url = require('url'),
    competition_dao = require('../../dao/competition_dao');

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
        console.log('Checking existance of ' + n_users + ' users...');
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

    function check_user(n_users, i) {
        if (i >= n_users) {
            end_success(-1);
        } else {
            if (req_params.user_data[i].type === 'new') {
                // Check user data params, make sure all required fields are present...
                // Check to see if username is already taken...
                // User will not be created now - it will be created after the
                //  team is successfully created. The team will be removed
                //  if a user actually fails to be created after the fact,
                //  along with successfully created users.
                var udat = req_params.user_data[i].data;
                console.log(udat);

                if (udat.username === undefined || udat.username === '') {
                    err_list.push({ param: 'user_data[' + i + '].data.username', error: 'Must provide user name' });
                }

                check_user(n_users, i + 1);
            } else if (req_params.user_data[i].type === 'existing') {
                check_user(n_users, i + 1);
            } else if (req_params.user_data[i].type === 'blank') {
                check_user(n_users, i + 1);
            } else {
                err_list.push({ param: 'user_data[' + i + '].type', error: 'Unrecognized user type "' + req_params.user_data[i].type + '"' });
                check_user(n_users, i + 1);
            }
        }
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