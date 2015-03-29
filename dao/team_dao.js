'use strict';

var mysql = require('mysql'),
	credentials = require('./credentials'),
	entities = require('entities');

var connection,
	active_query_count = 0,
	work_factor = 10;

function getConnection() {
	if (!connection) {
		connection = mysql.createConnection(credentials.getCredentials());
	}

	// NEXT VERSION: Handle connection errors here

	return connection;
}

// NEXT VERSION: Build in reportQueryActive and
//  reportQueryEnded so you don't have to manually call them.
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

exports.registerUserToTeam = function (user_id, team_id, callback) {
	if (user_id === undefined) {
		callback(null, 'No user ID provided');
	} else if (team_id === undefined) {
		callback(null, 'No team ID provided');
	} else {
		getConnection().query('INSERT INTO UserTeam (user_id, team_id) VALUES (?, ?);',
			[user_id, team_id],
			function (err, res) {
				if (err) {
					callback(null, 'MySQL Err: ' + err);
				} else {
					callback(res.insertId);
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}
};

exports.registerTeam = function (team_data, callback) {
	if (team_data === undefined) {
		callback(null, 'No team data provided');
	} else if (team_data.name === undefined || team_data.name === '') {
		callback(null, 'No team name provided (name)');
	} else if (team_data.tagline === undefined) {
		callback(null, 'Tagline is undefined (blank is ok) (tagline)');
	} else if (team_data.competition_id === undefined || isNaN(parseInt(team_data.competition_id)) || team_data.competition_id <= 0) {
		callback(null, 'Competition ID not provided, or not a positive number (competition_id)');
	} else {
		getConnection().query('INSERT INTO Team (name, tagline, competition_id) VALUES (?, ?, ?);',
			[team_data.name, team_data.tagline, team_data.competition_id],
			function (err, res) {
				if (err) {
					callback(null, 'MySQL Err: ' + err);
				} else {
					callback(res.insertId);
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}
};

exports.teamNameAvailable = function (team_name, compID, callback) {
	if (team_name === undefined || team_name === '') {
		callback(false);
	} else {
		getConnection().query('SELECT COUNT(*) AS ct FROM Team WHERE name = ? AND competition_id = ?;', [team_name, compID], function (err, res) {
			if (err) {
				console.log('Error in getting team counts: ' + err);
				callback(false);
			} else {
				callback((res[0].ct === 0));
			}
			reportQueryEnded();
		});
		reportQueryActive();
	}
};

exports.getTeamData = function (data, callback) {
	if (data === undefined || (data.teamID === undefined && (data.userID === undefined || data.compID === undefined))) {
		callback(null, 'No unique key provided - provide teamID or userID');
	} else if (data.teamID !== undefined) {
		getConnection().query('SELECT id, name, tagline, competition_id AS comp_id FROM Team WHERE id = ?;', data.teamID,
			function (err, res) {
				if (err) {
					callback(null, err);
				} else {
					if (res.length === 1) {
						callback(res[0]);
					} else {
						console.log('team_dao: Too many results returned! Returned: ' + res.length);
						callback(null, 'Too many results received!');
					}
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	} else if (data.userID !== undefined && data.compID !== undefined) {
		getConnection().query('SELECT Team.id, name, tagline, competition_id AS comp_id FROM Team LEFT JOIN UserTeam ON UserTeam.team_id = Team.id '
			+ 'WHERE UserTeam.user_id = ? AND Team.competition_id = ?;',
			[data.userID, data.compID],
			function (err, res) {
				if (err) {
					callback(null, err);
				} else {
					if (res.length === 1) {
						callback(res[0]);
					} else {
						console.log('team_dao: Too many results returned - ' + res.length);
						callback(null, 'Too many results received!');
					}
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	} else {
		callback(null, 'No unique key provided. Provide teamID or userID');
	}
};