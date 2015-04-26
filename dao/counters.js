/**
 * Created by Kamaron on 4/22/2015.
 */

// This file works with a collection that stores the counters, the next
//  allocatable ID, for the entries in the database.

var connection_settings = require('./connection_settings'),
    MongoClient = require('mongodb').MongoClient;

exports.get_next_user_id = function (cb) {
    get_entry_well_at_least_for_this_module('next_user_id', cb);
};

exports.get_next_problem_id = function (cb) {
    get_entry_well_at_least_for_this_module('next_problem_id', cb);
};

function get_entry_well_at_least_for_this_module(field_name, cb) {
    if (field_name === undefined || field_name === '') {
        cb('No field name provided!');
    } else {
        MongoClient.connect(connection_settings.url, function (err, db) {
            if (err) {
                cb (err);
            } else {
                var collection = db.collection('counters');
                collection.find({ field: field_name}).toArray(function (aerr, aresults) {
                    if (aerr) {
                        cb (aerr);
                    } else {
                        if (aresults.length === 0) {
                            collection.insertOne({ field: field_name, next_id: 1 }, function (cerr, cres) {
                                if (cerr) {
                                    cb (cerr);
                                } else {
                                    db.close();
                                    cb(null, 0);
                                }
                            });
                        } else {
                            collection.updateOne({ field: field_name}, {$set: { next_id: aresults[0].next_id + 1 }}, { w: 1 }, function (berr) {
                                if (berr) {
                                    cb(berr);
                                } else {
                                    console.log(aresults);
                                    db.close();
                                    cb(null, aresults[0].next_id);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}