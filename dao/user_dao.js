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
                                            db.close();
                                            cb(cerr);
                                        } else {
                                            bcrypt.hash(password, salt, function (derr, pass_hash) {
                                                if (derr) {
                                                    db.close();
                                                    cb(derr);
                                                } else {
                                                    collection.insertOne({
                                                        user_id: uid,
                                                        username: username,
                                                        pass_hash: pass_hash,
                                                        email: email,
                                                        is_admin: is_admin
                                                    }, function (cerr, cres) {
                                                        if (cerr) {
                                                            db.close();
                                                            cb(cerr);
                                                        } else {
                                                            db.close();
                                                            cb(null, uid);
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
                            cb(null, aresults[0]);
                        }
                    }
                });
            }
        });
    }
};

exports.get_user_by_username = function (username, cb) {
    if (username === undefined || username === '') {
        cb('No valid username provided');
    } else {
        MongoClient.connect(connection_settings.url, function (err, db){
            if (err) {
                db.close();
                cb(err);
            } else {
                var collection = db.collection('user_data');
                collection.find({ username: username }).toArray(function (aerr, ares) {
                    if (aerr) {
                        db.close();
                        cb(aerr);
                    } else {
                        if (ares.length === 0) {
                            db.close();
                            cb();
                        } else {
                            db.close();
                            cb(null, ares[0]);
                        }
                    }
                });
            }
        });
    }
};

exports.authenticate_user = function (username, password, cb) {
    if (username === undefined || username === '') {
        cb('Must provide valid username');
    } else if (password === undefined || password === '') {
        cb('Must provide password');
    } else {
        MongoClient.connect(connection_settings.url, function (err, db) {
            if (err) {
                db.close();
                cb(err);
            } else {
                var collection = db.collection('user_data');
                collection.find({ username: username }).toArray(function (aerr, ares) {
                    if (aerr) {
                        db.close();
                        cb(aerr);
                    } else {
                        if (ares.length === 0){
                            db.close();
                            cb(undefined, false);
                        } else {
                            bcrypt.compare(password, ares[0].pass_hash, function (berr, bres) {
                                if (berr) {
                                    db.close();
                                    cb(berr);
                                } else {
                                    cb(null, bres);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
};