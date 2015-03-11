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

function getComparisonProgramList(callback) {
	console.log('comparison_program_dao: Getting list of comparison programs available');

	getConnection().query('SELECT id, name, description FROM ComparisonPrograms ORDER BY name;', function (err, rows) {
		if (err) {
			callback(null, err);
		} else {
			callback(rows);
		}
		reportQueryEnded();
	});
	reportQueryActive();
}

exports.getComparisonProgramList = getComparisonProgramList;