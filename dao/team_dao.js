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
            function (res, err) {
                if (err) {
                    cb(undefined, 'MYSQL error: ' + err);
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
        credentials.zora_query('DELETE FROM Team WHERE id = ? LIMIT 1;', [teamID],
            function (res, err) {
                if (err) {
                    cb(undefined, 'MYSQL error: ' + err);
                } else {
                    cb(true);
                }
            }
        );
    }
};