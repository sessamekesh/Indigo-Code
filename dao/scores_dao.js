'use strict';

var mysql = require('mysql'),
	credentials = require('./credentials'),
	problem_dao = require('./problem_dao');

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
		console.log('Closing connection scores_dao...');
		connection.end();
		connection = undefined;
	} else if (active_query_count < 0) {
		console.log('scores_dao: wierd bug: somehow less than 0 connections are open');
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
		'SELECT DISTINCT problem_id FROM Submission '
			+ 'LEFT JOIN Problem ON problem_id = Problem.id '
			+ 'WHERE result = \'AC\' AND user_id = ? AND Problem.competition_id = ?;',
		[userID, competitionID],
		function (err, res) {
			if (err) {
				console.log('scores_dao ERROR: Could not get number of correct submissions: ' + err);
			} else {
				score = res.length;
				console.log('scores_dao ACGET success ' + score);
				getSubmissionTimePenalty(res);
			}
			reportQueryEnded();
		}
	);
	reportQueryActive();

	function getSubmissionTimePenalty(problems_solved) {
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
					//time_penalty = (res[0].submission_time - res[0].start_time);
					// NOTE: This is in milliseconds, so get it to minutes... yeah.
					time_penalty = (res[0].submission_time - res[0].start_time);
					time_penalty /= 1000; // seconds
					time_penalty /= 60; // minutes
					getTimePenalty(problems_solved, 0);
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}

	function getTimePenalty(problems_solved, i) {
		console.log('scores_dao: get time penalty');
		// TODO KIP: This is inaccurate, you need to
		//  go through each problem that has been correctly solved,
		//  and individually add up the incorrect attempts from those.

		if (i >= problems_solved.length) {
			updateMahScore();
		} else {
			getConnection().query(
				'SELECT COUNT(*) AS incorrect_count FROM Submission '
					+ 'WHERE (result=\'TLE\' OR result=\'RE\' OR result=\'WA\')'
					+ 'AND user_id = ? AND problem_id = ? '
					+ 'AND submission_time < (SELECT submission_time FROM '
						+ 'Submission WHERE result=\'AC\' AND user_id = ? '
						+ 'AND problem_id = ? ORDER BY submission_time ASC LIMIT 1);',
				[userID, problems_solved[i].problem_id, userID, problems_solved[i].problem_id],
				function (err, res) {
					if (err) {
						console.log('score_dao: Coult not find time penalty for problem ' + problems_solved[i].problem_id + ': ' + err);
					} else {
						// Update time penalty, on to the next one:
						time_penalty += (incorrect_submission_time_penalty * res[0].incorrect_count);
						getTimePenalty(problems_solved, i + 1);
					}
					reportQueryEnded();
				}
			);
			reportQueryActive();
		}
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

exports.getScoreboardData = function(compData, start, finish, callback) {
	console.log('scores_dao: Getting scoreboard for competition ' + compData.name);
	var query_text = 'SELECT User.user_name AS user_name, User.tagline AS tagline, '
		+ 'Score.score AS score, Score.time_penalty AS time_penalty',
		query_params = [];
	// Add on a field for each problem
	problem_dao.getProblemsInCompetition(compData.id, function (res, err) {
		if (err) {
			callback(null, 'Could not retrieve problems in competition: ' + err);
		} else {
			for (var i = 0; i < res.length; i++) {
				query_text += ', IF((SELECT COUNT(*) FROM Submission WHERE problem_id = ? AND user_id = User.id AND result = \'AC\') > 0, \'SOLVED\', '
						+ 'IF((SELECT COUNT(*) FROM Submission WHERE problem_id = ? AND user_id = User.id AND result <> \'AC\') < 0, \'ATTEMPTING\', \'EMPTY\')) AS '
						+ '? ';
				query_params.push(res[i].id);
				query_params.push(res[i].id);
				query_params.push('ps_' + res[i].id)
			}
			finishGeneratingAndPerformQuery();
		}
		reportQueryEnded();
	});
	reportQueryActive();

	function finishGeneratingAndPerformQuery() {
		query_text += 'FROM Score LEFT JOIN User ON Score.user_id = User.id '
			+ 'WHERE competition_id = ? ORDER BY score DESC, time_penalty ASC LIMIT ?, ?;';
		query_params.push(compData.id);
		query_params.push(start);
		query_params.push(finish - start);

		console.log('DEBUG:');
		console.log('------');
		console.log(query_text);
		console.log();
		console.log(query_params);

		getConnection().query(query_text, query_params, function (err, rows) {
			if (err) {
				callback (null, 'Could not retrieve scoreboard data - ' + err);
			} else {
				callback(rows);
			}
			reportQueryEnded();
		});
		reportQueryActive();
	}
}