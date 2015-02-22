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

exports.updateScore = function(userID, competitionID, incorrect_submission_time_penalty) {
	// Get number of correct submissions: this is score
	// Get number of RE/BE/TLE/..., multiply by incorrect submission time
	//  penalty, and add the time of the last correct submission: this is
	//  time penalty.

	console.log('scores_dao: updateScore called');
	var score, time_penalty;

	getConnection().query(
		'SELECT COUNT(DISTINCT problem_id) AS ac FROM Submission '
			+ 'LEFT JOIN Problem ON problem_id = Problem.id '
			+ 'WHERE result = \'AC\' AND user_id = ? AND Problem.competition_id = ?;',
		[userID, competitionID],
		function (err, res) {
			if (err) {
				console.log('scores_dao ERROR: Could not get number of correct submissions: ' + err);
			} else if (res.length != 1) {
				console.log('scores_dao ERROR: Unexpected number of columns returned on score query ' + res.length);
			} else {
				score = res[0].ac;
				console.log('scores_dao ACGET success ' + score);
				getSubmissionTimePenalty();
			}
			reportQueryEnded();
		}
	);
	reportQueryActive();

	function getSubmissionTimePenalty() {
		console.log('scores_dao: Get submission time penalty');
		getConnection().query(
			'SELECT submission_time, Competition.start_date AS start_time FROM Submission '
				+ 'LEFT JOIN Problem ON problem_id = Problem.id '
				+ 'LEFT JOIN Competition ON Problem.competition_id = Competition.id '
				+ 'WHERE result=\'AC\' '
				+ 'AND user_id = ? AND Problem.competition_id = ? '
				+ 'ORDER BY submission_time ASC LIMIT 1;',
			[userID, competitionID],
			function (err, res) {
				if (err) {
					console.log('scores_dao ERROR: Could not get time of last submission: ' + err);
				} else if (res.length != 1) {
					console.log('scores_dao ERROR: Unexpected number of columns returned on checking lastAC time penalty ' + res.length);
				} else {
					console.log('scores_dao ACPEN success');
					console.log('scores_dao DEBUG REMOVE: Time of start: ' + (res[0].start_time));
					console.log('scores_dao DEBUG REMOVE: Time of last succ: ' + res[0].submission_time);
					console.log('scores_dao DEBUG REMOVE: Time elapsed since competition begin: ' + (res[0].submission_time - res[0].start_time));
					//time_penalty = (res[0].submission_time - res[0].start_time);
					// NOTE: This is in milliseconds, so get it to minutes... yeah.
					time_penalty = (res[0].submission_time - res[0].start_time);
					time_penalty /= 1000; // seconds
					time_penalty /= 60; // minutes
					getTimePenalty();
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}

	function getTimePenalty() {
		console.log('scores_dao: get time penalty');
		// TODO KIP: This is inaccurate, you need to
		//  go through each problem that has been correctly solved,
		//  and individually add up the incorrect attempts from those.
		getConnection().query(
			'SELECT COUNT(*) AS incorrect_submission_count FROM Submission '
				+ 'LEFT JOIN Problem ON problem_id = Problem.id '
				+ 'WHERE (result=\'TLE\' OR result=\'RE\' OR result=\'WA\')'
				+ 'AND user_id = ? AND Problem.competition_id = ? '
				+ 'AND submission_time < (SELECT submission_time FROM '
					+ 'Submission LEFT JOIN Problem ON problem_id = Problem.id '
					+ 'WHERE result=\'AC\' AND user_id = ? '
					+ 'AND Problem.competition_id = ? ORDER BY submission_time ASC LIMIT 1);',
			[userID, competitionID, userID, competitionID],
			function (err, res) {
				if (err) {
					console.log('scores_dao ERROR: Could not get time penalty: ' + err);
				} else if (res.length != 1) {
					console.log('scores_dao ERROR: Unexpected number of columns returned on time penalty query ' + res.length);
				} else {
					time_penalty += (incorrect_submission_time_penalty * res[0].incorrect_submission_count);
					console.log('scores_dao TPGET success: ' + time_penalty);
					updateMahScore();
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}

	function updateMahScore() {
		console.log('scores_dao update my score ' + score + ' ' + time_penalty);
		if (score === undefined || time_penalty === undefined) {
			console.log('scores_dao ERR Miracle error! Somehow, score or time penalty is undefined.');
		} else {
			getConnection().query(
				'INSERT INTO Score(user_id, competition_id, score, time_penalty) VALUES(?, ?, ?, ?) '
				+ 'ON DUPLICATE KEY UPDATE score=VALUES(score), time_penalty=VALUES(time_penalty);',
				[userID, competitionID, score, time_penalty],
				function (err, res) {
					if (err) {
						console.log('scores_dao ERROR: Could not update score: ' + err);
					}
					console.log('scores_dao FINISHED');
					reportQueryEnded();
				}
			);
			reportQueryActive();
		}
	}
}