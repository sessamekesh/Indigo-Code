/**
 * Created by Kamaron on 4/22/2015.
 */

var MongoClient = require('mongodb').MongoClient,
    connection_settings = require('./connection_settings'),
    counters = require('./counters');

exports.get_team_data = function (team_id, cb) {
    cb(null, {
        team_id: team_id,
        comp_id: 0,
        team_name: 'Team Awesome',
        tagline: 'Definitely gonna win',
        users: [0],
        share_code: true,
        is_admin: true
    });
};

exports.create_new_team = function (team_name, team_tagline, user_ids, comp_id, is_admin, share_code, cb) {
    if (team_name === undefined || team_name === '') {
        cb('Team name must be defined!');
    } else if (user_ids === undefined || isNaN(user_ids.length) || user_ids.length < 1) {
        cb('List of user IDs must be provided, and have at least one user');
    } else if (comp_id === undefined || isNaN(comp_id)) {
        cb('Must provide a competition ID');
    } else if (is_admin === undefined || (is_admin !== true && is_admin !== false)) {
        cb('Must provide an is_admin field - is the team an administrative team?');
    } else if (share_code === undefined || (share_code !== true && share_code !== false)) {
        cb('Must provide a true-false value, if the team is okay sharing code');
    } else {
        // TODO KIP: Replace with filling up the team, and returning the team ID\
        MongoClient.connect(connection_settings.url, function (err, db) {
            if (err) {
                db.close();
                cb(err);
            } else {
                var collection = db.collection('team_data');
                collection.find({ team_name: team_name }, function (aerr, ares) {
                    if (aerr) {
                        db.close();
                        cb(aerr);
                    } else {
                        if (aresults.length !== 0) {
                            db.close();
                            cb('Team name ' + team_name + ' is already taken');
                        } else {
                            counters.get_next_team_id(function (berr, bid) {
                                if (berr) {
                                    db.close();
                                    cb(berr);
                                } else {
                                    // Insert team...
                                    collection.insertOne({
                                        // TODO KIP: Insert thing here
                                        team_id: bid,
                                        team_name: team_name,
                                        team_tagline: team_tagline,
                                        user_ids: user_ids,
                                        comp_id: comp_id,
                                        is_admin: is_admin,
                                        share_code: share_code
                                    }, function (cerr, cres) {
                                        if (cerr) {
                                            db.close();
                                            cb(cerr);
                                        } else {
                                            console.log('To sate my curiosity, the result of new team is ' + cres);
                                            db.close();
                                            cb(bid);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
        cb(undefined, 2);
    }
};