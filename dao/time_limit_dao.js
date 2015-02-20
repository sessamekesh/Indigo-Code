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

exports.getTimeLimit = function(problemID, languageID, callback) {
	console.log('time_limit_dao: Querying for time limit to problem ID ' + problemID + ', language ' + languageID);
	getConnection().query(
		'SELECT time_limit FROM TimeLimit WHERE problem_id = ? AND language_id = ?;',
		[problemID, languageID],
		function (err, res) {
			if (err) {
				callback(null, 'SQL error: ' + err);
			} else {
				if (res.length == 1) {
					callback(res[0].time_limit);
				} else if(res.length == 0) {
					// Use default...
					callback('USE_DEFAULT');
				} else {
					console.log('time_limit_dao: Too many results returned! Expected 1, got ' + res.length);
					callback(null, 'Error: Too many results returned (' + res.length + ')');
				}
			}
			reportQueryActive();
		}
	);
	reportQueryActive();
}