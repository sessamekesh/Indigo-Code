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

function reportSubmissionReceived(lang_id, problem_id, user_id, submission_time, callback) {
	console.log('submission_dao: Reporting a submission received');
	getConnection().query(
		'INSERT INTO Submission'
		+ '(lang_id, problem_id, user_id, result, source_code, submission_time, notes)'
		+ 'VALUES(?, ?, ?, \'Q\', \'\', ?, \'\');',
		[lang_id, problem_id, user_id, submission_time],
		function (error, res) {
			if (error) {
				callback(null, error);
			} else {
				callback(res.insertId);
			}
			reportQueryEnded();
		}
	);
	reportQueryActive();
}

function reportSubmissionResult(submission_id, source_code_data, result, notes, callback) {
	console.log('submission_dao: Reporting submission results');
	getConnection().query(
		'UPDATE Submission SET '
		+ 'result = ?, source_code = ?, notes = ?'
		+ ' WHERE id = ?';,
		[result, source_code_data, notes, submission_id],
		function(error, res) {
			if (error) {
				callback(null, error);
			} else {
				callback();
			}
			reportQueryEnded();
		}
	);
	reportQueryActive();
}

// start: number to start at (0)
// end: number to end at (25)
function getProblemSubmissions(problemID, start, end, callback) {
	console.log('submission_dao: Retrieving submissions for problem ID ' + problemID);
	getConnection().query(
		'SELECT User.user_name AS user_name, User.tagline AS user_tagline, Language.name AS lang_name, Problem.name AS problem_name, result, notes'
		+ ' FROM Submission'
		+ ' LEFT JOIN User ON Submission.user_id = User.id'
		+ ' LEFT JOIN Problem ON Submission.problem_id = Problem.id'
		+ ' LEFT JOIN Language ON Language.id = Submission.lang_id'
		+ ' WHERE Submission.problem_id = ? ORDER BY Submission.submission_time DESC;', problemID,
		function (err, result) {
			if (err) {
				callback(null, err);
			} else {
				callback(result);
			}
			reportQueryEnded();
		}
	);
	reportQueryActive();
}

exports.reportSubmissionReceived = reportSubmissionReceived;
exports.reportSubmissionResult = reportSubmissionResult;
exports.getProblemSubmissions = getProblemSubmissions;