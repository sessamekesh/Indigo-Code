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

function getProblemsInCompetition(compID, callback) {
	console.log('problem_dao: Getting list of problems in competition ' + compID);
	getConnection().query('SELECT id, name, description_file_path AS \'desc_path\' FROM Problem WHERE competition_id = ?;', compID,
		function (err, rows) {
			if (err) {
				callback(null, 'problem_dao SQL ERR: ' + err);
			} else {
				callback(rows);
			}
			reportQueryEnded();
		});
	reportQueryActive();
}

exports.getProblemsInCompetition = getProblemsInCompetition;