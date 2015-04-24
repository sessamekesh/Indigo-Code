/**
 * Created by Kamaron on 4/22/2015.
 */

// This file works with a collection that stores the counters, the next
//  allocatable ID, for the entries in the database.

var MongoClient = require('mongodb').MongoClient,
    connection_settings = require('./connection_settings');

exports.get_next_user_id = function (cb) {
    // TODO KIP: Get this from the Mongo database
    cb(1);
};

exports.get_next_problem_id = function (cb) {
    // TODO KIP: Get this from the Mongo database
    cb(1);
};