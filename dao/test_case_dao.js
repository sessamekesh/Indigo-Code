'use strict';

var mysql = require('mysql'),
	credentials = require('./credentials');

var connection,
	active_query_count = 0;

function getConnection() {
	if (!connection) {
		connection = mysql.createConnection(credentials.getCredentials());
	}

	return connection;
}

function reportQueryActive() {
	active_query_count++;
}

function reportQueryEnded() {
	active_query_count--;
	if (active_query_count == 0) {
		console.log('Closing connection problem_dao...');
		connection.end();
		connection = undefined;
	} else if (active_query_count < 0) {
		console.log('problem_dao: wierd bug: somehow less than 0 connections are open');
	}
}

// callback: res, err
exports.getTestCases = function(problemID, callback) {
	getConnection().query('SELECT id, problem_id, comparison_program_id FROM TestCase WHERE problem_id = ?;',
		problemID,
		function (err, res) {
			if (err) {
				callback(null, 'SQL Error: ' + err);
			} else {
				callback(res);
			}
			reportQueryEnded();
		}
	);
	reportQueryActive();
}