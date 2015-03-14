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

function reportSubmissionReceived(lang_id, problem_id, team_id, submission_time, callback) {
	console.log('submission_dao: Reporting a submission received at ' + submission_time);
	getConnection().query(
		'INSERT INTO Submission'
		+ '(lang_id, problem_id, team_id, result, submission_time, notes)'
		+ 'VALUES(?, ?, ?, \'Q\', FROM_UNIXTIME(?), \'\');',
		[lang_id, problem_id, team_id, submission_time],
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

function reportSubmissionResult(submission_id, result, notes, callback) {
	console.log('submission_dao: Reporting submission results');
	getConnection().query(
		'UPDATE Submission SET '
		+ 'result = ?, notes = ?'
		+ ' WHERE id = ?',
		[result, notes, submission_id],
		function (error, res) {
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

function checkSubmissionTimeout(submission_id, timeout_callback, error_callback) {
	console.log('submission_dao: Checking to see if submission ' + submission_id + ' has timed out...');
	getConnection().query(
		'SELECT result FROM Submission WHERE id = ?;', submission_id,
		function (error, res) {
			if (error || res.length == 0) {
				error_callback('Could not find submission with ID ' + submission_id + (error) ? ': ' + error : '');
			} else if (res.length > 1) {
				error_callback('Multiple results found!');
			} else if (res[0].result === 'Q') {
				timeout_callback();
				getConnection().query('UPDATE Submission SET result=\'IE\', notes=\'Framework had an unexpected error, submission timed out. Check logs.\' WHERE id = ?;', submission_id,
					function (error, res) {
						if (error) {
							error_callback('Error updating timed out submission - ' + error);
						}
						reportQueryEnded();
					}
				);
			}
			reportQueryActive();
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
		'SELECT Submission.id AS submission_id, submission_time, Team.name AS name, Team.tagline AS user_tagline,'
		+ ' Language.name AS lang_name, Problem.name AS problem_name, result, notes'
		+ ' FROM Submission'
		+ ' LEFT JOIN Team ON Submission.team_id = Team.id'
		+ ' LEFT JOIN Problem ON Submission.problem_id = Problem.id'
		+ ' LEFT JOIN Language ON Language.id = Submission.lang_id'
		+ ' WHERE Submission.problem_id = ? ORDER BY Submission.submission_time DESC'
			+ ((start !== undefined && end !== undefined) ? ' LIMIT ?, ?;' : ';'),
		((start !== undefined && end !== undefined)
			? [problemID, start, (end - start)]
			: problemID),
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
exports.checkSubmissionTimeout = checkSubmissionTimeout;