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

function addNewProblem(probData, callback) {
	console.log('problem_dao: Adding new problem data!');
	if (probData === undefined) {
		callback(null, 'No problem data provided!');
	} else if (probData.prob_name === undefined || probData.prob_name === '') {
		callback(null, 'No problem name provided!');
	} else if (probData.comp_id === undefined) {
		callback(null, 'No competition id provided!');
	} else if (probData.description_file_path === undefined) {
		callback(null, 'No problem description file path specified!');
	} else if (probData.description_file_type === undefined) {
		callback(null, 'No problem description file type specified!');
	} else if (probData.default_time_limit === undefined) {
		callback(null, 'No default time limit for specified!');
	} else {
		console.log('problem_dao: Array to insert:');
		console.log([probData.comp_id, probData.prob_name, probData.description_file_path, probData.description_file_type, probData.default_time_limit]);
		getConnection().query('INSERT INTO Problem '
			+ '(name, competition_id, description_file_path, description_file_type, default_time_limit)'
			+ ' VALUES (?, ?, ?, ?, ?);',
			[probData.prob_name, probData.comp_id, probData.description_file_path, probData.description_file_type, probData.default_time_limit],
			function (err, res) {
				if (err) {
					callback(null, err);
				} else {
					callback(res.insertId);
				}
				reportQueryEnded();
			});
		reportQueryActive();
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

function getProblemData(problemID, callback) {
	console.log('problem_dao: Retrieving problem data for problem ' + problemID);

	if (!problemID) {
		console.log('problem_dao: Returning error, no problem ID reported');
	} else {
		// id, name, compID, desc_path, content_type
		var query = getConnection().query('SELECT Problem.id, Problem.name, '
			+ 'competition_id AS comp_id, description_file_path AS desc_path, '
			+ 'default_time_limit AS time_limit, content_type FROM Problem LEFT JOIN ContentType '
			+ 'ON ContentType.id = description_file_type WHERE Problem.id = ?;',
			problemID,
			function(err, rows) {
				if (err) {
					callback(null, 'problem_dao: MYSQL error: ' + err);
				} else {
					if (rows.length <= 0 || rows.length > 1) {
						callback(null, 'problem_dao: MYSQL query returned ' + rows.length + ' results, expected 1');
					} else {
						callback(rows[0]);
					}
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}
}

exports.getProblemsInCompetition = getProblemsInCompetition;
exports.getProblemData = getProblemData;
exports.addNewProblem = addNewProblem;