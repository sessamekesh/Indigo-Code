/**
 * Created by kamaron on 3/31/15.
 */

'use strict';

var mysql = require('mysql'),
    connection,
    active_query_count = 0;

function getCredentials() {
    return {
        host: 'localhost',
        user: 'zora',
        password: 'easy',
        database: 'zora'
    }
};

// zora_query: Wrapper around connection.query method that ensures
//  that only one global connection is used, and shuts it down when
//  it is no longer in use.

// cb: Function with parameter "connection", the connection to use.
exports.zora_query = function(query_text, query_params, cb) {
    if (connection === undefined || connection === null) {
        connection = mysql.createConnection(getCredentials());
    }

    active_query_count++;
    connection.query(query_text, query_params, function (err, res) {
        cb(err, res);

        active_query_count--;
        if (active_query_count === 0) {
            connection.end();
            connection = undefined;
        }
    });
};