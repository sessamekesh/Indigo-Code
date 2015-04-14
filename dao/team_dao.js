/**
 * Created by kamaron on 4/8/15.
 */
'use strict';

var credentials = require('./credentials');

exports.addTeam = function (team_name, tagline, comp_id, notes, cb) {
    if  (tagline === undefined) {
        tagline = '';
    }

    if (team_name === undefined || team_name === '') {
        cb(undefined, 'Must specify a team name');
    } else if (comp_id === undefined || isNaN(parseInt(comp_id))) {
        cb(undefined, 'Must specify an integer competition id');
    } else {
        credentials.zora_query('INSERT INTO Team(comp_id, team_name, tagline, notes) VALUES (?, ?, ?, ?);',
            [comp_id, team_name, tagline, notes],
            function (err, res) {
                if (err) {
                    cb(undefined, 'MYSQL error: ' + JSON.stringify(err));
                } else {
                    cb(res.insertId);
                }
            }
        );
    }
};

exports.removeTeam = function (teamID, cb) {
    if (teamID === undefined || isNaN(parseInt(teamID))) {
        cb(undefined, 'Must provide a valid team ID');
    } else {
        // First, be sure to delete UserTeam entries...
        credentials.zora_query('DELETE FROM UserTeam WHERE team_id = ?;',
            [teamID],
            function (err, res) {
                if (err) {
                    cb(undefined, 'MySQL error: ' + JSON.stringify(err));
                } else {
                    credentials.zora_query('DELETE FROM Team WHERE id = ? LIMIT 1;',
                        [teamID],
                        function (err, res) {
                            if (err) {
                                cb(undefined, 'MYSQL error: ' + JSON.stringify(err));
                            } else {
                                cb(true);
                            }
                        }
                    );
                }
            }
        );
    }
};

exports.addUserToTeam = function (userID, teamID, cb) {
    if (userID === undefined || isNaN(parseInt(userID))) {
        cb(undefined, 'Must provide a user ID to link to a team');
    } else if (teamID === undefined || isNaN(parseInt(teamID))) {
        cb(undefined, 'Must provide the ID of the team to which to attach the provided user');
    } else {
        credentials.zora_query('INSERT INTO UserTeam(team_id, user_id) VALUES (?, ?);',
            [teamID, userID],
            function (err, res) {
                if (err) {
                    cb(undefined, 'MySQL error: ' + JSON.stringify(err));
                } else {
                    cb(res.insertId);
                }
            }
        );
    }
};