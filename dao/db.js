/**
 * Created by Kamaron on 5/12/2015.
 */

/**
 * Maintain configuration here.
 */

var mysql = require('mysql');
var connection;
var active_query_ct;
var timeout_id;
var CONNECTION_CLOSE_WAIT = 500; // Time (ms) after executing a query after which to attempt to close the DB connection

function getCredentials() {
    return {
        host: 'localhost',
        user: 'zora',
        password: 'easy',
        database: 'zoradb'
    };
}

// Wrapper function, ensures only one global connection is used, and shuts
//  it down when it is no longer in use.
exports.owl_query = function (query_text, query_params, cb) {
    if (!connection) {
        connection = mysql.createConnection(getCredentials());
        connection.on('error', function () {});
    }

    active_query_ct++;

    connection.query(query_text, query_params, function (err, res) {
        cb(err, res);
        active_query_ct--;

        if (timeout_id) {
            clearTimeout(timeout_id);
        }

        timeout_id = setTimeout(function () {
            if (active_query_ct === 0) {
                connection.end();
                connection = null;
            }
            timeout_id = null;
        }, CONNECTION_CLOSE_WAIT);
    });
};