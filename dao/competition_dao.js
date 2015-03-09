'use strict';

var mysql = require('mysql'),
	credentials = require('./credentials');

var connection,
	active_query_count = 0;

function getConnection() {
	if (!connection) {
		connection = mysql.createConnection(credentials.getCredentials());
	}

	// NEXT VERSION: Unify getConnection functions, handle connection errors.
	return connection;
}

function reportQueryActive() {
	active_query_count++;
	console.log('user_dao query count: ' + active_query_count);
}

function reportQueryEnded() {
	active_query_count--;
	console.log('user_dao query count: ' + active_query_count);
	if (active_query_count == 0) {
		console.log('Closing connection user_dao...');
		connection.end();
		connection = undefined;
	}
}

function addNewCompetition(compData, callback) {
	console.log('competition_dao: Adding new competition data');
	console.log(compData);
	if (compData === undefined) {
		callback(null, 'No competition description provided!');
	} else if (compData.comp_name === undefined) {
		callback(null, 'No competition name provided!');
	} else if (compData.htmlfrag_data === undefined) {
		callback(null, 'No HTML fragment data provided!');
	} else if (compData.is_private === undefined) {
		callback(null, 'No privacy data provided!');
	} else if (compData.start_date === undefined) {
		callback(null, 'No start date provided!');
	} else if (compData.end_date === undefined) {
		callback(null, 'No end date provided!');
	} else if (compData.max_team_size === undefined) {
		callback(null, 'No max team size provided!');
	} else if (compData.penalty_time === undefined) {
		callback(null, 'No penalty time provided!');
	} else {
		getConnection().query('INSERT INTO Competition (name, htmlfrag_data, is_private, start_date, end_date, max_team_size, incorrect_submission_time_penalty) VALUES (?, ?, ?, ?, ?, ?, ?);',
			[compData.comp_name, compData.htmlfrag_data, compData.is_private,
			compData.start_date, compData.end_date, compData.max_team_size, compData.penalty_time],
			function (err, res) {
			if (err) {
				callback(null, err);
			} else {
				console.log(res.insertId);
				callback(res.insertId);
			}

			reportQueryEnded();
		});
		reportQueryActive();
	}
}

function modifyExistingCompetition(compID, compData, callback) {
	console.log('competition_dao: Modifying competition ' + compID);
	console.log(compData);

	if (compID === undefined) {
		callback(null, 'No competition ID provided!');
	} else if (compData === undefined) {
		callback(null, 'No competition description provided!');
	} else if (compData.comp_name === undefined) {
		callback(null, 'No competition name provided!');
	} else if (compData.htmlfrag_data === undefined) {
		callback(null, 'No HTML fragment data provided!');
	} else if (compData.is_private === undefined) {
		callback(null, 'No privacy data provided!');
	} else if (compData.start_date === undefined) {
		callback(null, 'No start date provided!');
	} else if (compData.end_date === undefined) {
		callback(null, 'No end date provided!');
	} else if (compData.max_team_size === undefined) {
		callback(null, 'No max team size provided!');
	} else if (compData.penalty_time === undefined) {
		callback(null, 'No penalty time provided!');
	} else {
		getConnection().query('UPDATE Competition SET name = ?, htmlfrag_data = ?, is_private = ?, start_date = ?, end_date = ?, max_team_size = ?, incorrect_submission_time_penalty = ? WHERE id = ?;',
			[compData.comp_name, compData.htmlfrag_data, compData.is_private,
			compData.start_date, compData.end_date, compData.max_team_size, compData.penalty_time, compID],
			function (err, res) {
			if (err) {
				callback(null, err);
			} else {
				console.log(res);
				callback(res);
			}

			reportQueryEnded();
		});
		reportQueryActive();
	}
}

function deleteCompetition(compID, callback) {
	console.log('competition_dao: Deleting competition ' + compID);

	// TODO KIP: Other validation before deleting something.
	if (compID === undefined) {
		callback(null, 'No competition Id provided!');
	} else {
		getConnection().query('DELETE FROM Competition WHERE id = ? LIMIT 1;', compID, function (err, res) {
			if (err) {
				callback(null, err);
			} else {
				console.log(res);
				callback(res);
			}
			reportQueryEnded();
		});
		reportQueryActive();
	}
}

// Callback format: compData, err
// compData:
// - id, name, is_private, start_date, end_date
// - problems:
// - - id, name, description_file_path
function getCompetitionData(compDesc, callback) {
	console.log('competition_dao: Retrieving competition data for:');
	console.log(compDesc);

	if (!compDesc) {
		console.log('No competition description provided. Selecting names, ids of all competitions...');
		var query = getConnection().query('SELECT id, name FROM Competition;');
		reportQueryActive();
		var competition_list = [];
		var error_generated = false;
		query.on('error', function(err) {
			error_generated = true;
			callback(null, 'SQL - Select competition id, names: ' + err);
		});
		query.on('result', function(result) {
			competition_list.push({ id: result.id, name: result.name });
		});
		query.on('end', function() {
			if (!error_generated) {
				callback(competition_list);
			}
			reportQueryEnded();
		});
	} else if (compDesc.id) {
		// Grabbing one competition only
		console.log('Retrieving competition by ID: ' + compDesc.id);

		var query = getConnection().query('SELECT id, name, is_private, htmlfrag_data, start_date, end_date, max_team_size, incorrect_submission_time_penalty FROM Competition WHERE id = ?;', compDesc.id);
		reportQueryActive();
		var error_generated = false;
		var result;
		query.on('error', function(err) {
			error_generated = true;
			callback(null, 'SQL - Select competition by id ' + compDesc.id + ': ' + err);
		});
		query.on('result', function(res) {
			result = {
				id: res.id,
				name: res.name,
				htmlfrag_data: res.htmlfrag_data,
				is_private: res.is_private[0],
				start_date: res.start_date,
				end_date: res.end_date,
				team_size: res.max_team_size,
				incorrect_submission_time_penalty: res.incorrect_submission_time_penalty
			};
		});
		query.on('end', function() {
			reportQueryEnded();
			if (!error_generated) {
				callback(result);
			}
		});
	} else {
		// Catch-all case (if user tries to access a not implemented feature)
		callback(null, 'Case for provided user description not provided in competition_dao.js');
	}
}

//////////////////////////////////////////////////
// 
// getUpcomingCompetitions
//  timeframe: Time in seconds that is allowable (null for any period in future)
//
//////////////////////////////////////////////////
function getUpcomingCompetitions(timeframe, callback) {
	console.log('competition_dao: Getting upcoming competitions list...');
	var queryText;

	if (timeframe === undefined || timeframe === null || timeframe === 0) {
		// NEXT VERSION: Do ALL of your queries like this...
		getConnection().query('SELECT id, name, is_private FROM Competition WHERE start_date > NOW();',
			function(err, rows) {
				if (err) {
					callback(null, 'MYSQL error: ' + err);
				} else {
					callback(rows);
				}
				reportQueryEnded();
			});
		reportQueryActive();
	} else {
		getConnection().query('SELECT id, name, is_private FROM Competition WHERE start_date > NOW() AND DATE_SUB(start_date, INTERVAL ? SECOND) < NOW();',
			timeframe,
			function(err, rows) {
				if (err) {
					callback(null, 'MYSQL error: ' + err);
				} else {
					callback(rows);
				}
				reportQueryEnded();
			});
		reportQueryActive();
	}
}

function getOngoingCompetitions(callback) {
	console.log('competition_dao: Getting ongoing competitions list...');
	getConnection().query('SELECT id, name, is_private FROM Competition WHERE start_date < NOW() AND end_date > NOW();',
		function(err, rows) {
			if (err) {
				callback(null, 'MYSQL error: ' + err);
			} else {
				callback(rows);
			}
			reportQueryEnded();
		});
	reportQueryActive();
}

function getPreviousCompetitions(callback) {
	console.log('competition_dao: Getting previous competitions list...');
	getConnection().query('SELECT id, name, is_private FROM Competition WHERE end_date < NOW();',
		function(err, rows) {
			if (err) {
				callback(null, 'MYSQL error: ' + err);
			} else {
				callback(rows);
			}
			reportQueryEnded();
		});
	reportQueryActive();
}

function getHTMLFrag(compID, callback) {
	console.log('competition_dao: Retrieving HTML Fragment for competition #' + compID);

	var query = getConnection().query('SELECT htmlfrag_data FROM Competition WHERE id = ?;', compID),
		error_generated = true;
	reportQueryActive();
	query.on('error', function(err) {
		error_generated = true;
		callback(null, 'SQL - Get HTMLFrag for ' + compID + ': ' + err);
	});
	query.on('result', function(result) {
		callback(result.htmlfrag_data);
	});
	query.on('end', function() {
		reportQueryEnded();
	});
}

exports.getCompetitionData = getCompetitionData;
exports.getHTMLFrag = getHTMLFrag;
exports.getUpcomingCompetitions = getUpcomingCompetitions;
exports.getPreviousCompetitions = getPreviousCompetitions;
exports.getOngoingCompetitions = getOngoingCompetitions;
exports.addNewCompetition = addNewCompetition;
exports.modifyExistingCompetition = modifyExistingCompetition;
exports.deleteCompetition = deleteCompetition;