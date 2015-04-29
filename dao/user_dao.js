/**
 * Created by Kamaron on 4/22/2015.
 */

var MongoClient = require('mongodb').MongoClient,
    connection_settings = require('./connection_settings'),
    counters = require('./counters'),
    bcrypt = require('bcrypt'),
    work_factor = 10;

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
                                            
                                        }
                                    });
                                    collection.insertOne({
                                        user_id: uid,
                                        username: username,
                                        // TODO KIP: Pass hash here
                                        email: email,
                                        is_admin: is_admin
                                    }, function (cerr, cres) {
                                        if (cerr) {
                                            db.close();
                                            cb(cerr);
                                        } else {
                                            db.close();
                                            cb(uid);
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