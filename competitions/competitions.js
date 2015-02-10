'use strict';

var kokiriPage = require('../kokiriPage'),
	kokiriHeader = require('../kokiriHeader'),
	kokiriUserTab = require('../kokiriUserTab'),
	competitionSidebar = require('./competitionSidebar'),
	problems = require('./problems'),
	competitionPageLoader = require('./competitionPageLoader'),
	submission = require('./submission'),
	mysql = require('mysql'),
	scoreboard = require('./scoreboard'),
	viewSubmissions = require('./viewSubmissions');

// Callback format: [competitionsArray], err
// Optional flags:
//  return_count: specify number of competitions to return
//  get_future: defaults to false
//  get_previous: defaults to false
function GetListOfCompetitions(flags, callback) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	if (!flags) {
		flags = {};
	}

	if (!'get_future' in flags) {
		flags.get_future = false;
	}

	if (!'get_previous' in flags) {
		flags.get_previous = false;
	}

	if (!'get_current' in flags) {
		flags.get_current = true;
	}

	console.log('Getting list of competitions (competitions.js - 12)');

	var query, resultArray = [], queryString = '', firstWhere = false, paramsArray = [];

	// Build Select...
	queryString = 'SELECT id, name, start_date, end_date, is_private';

	// Build From...
	queryString += ' FROM Competitions';

	// Build Where...
	if (flags.get_previous == false) {
		queryString += (firstWhere == true ? ' AND' : ' WHERE') + ' end_date > NOW()';
		firstWhere = true;
	}
	if (flags.get_future == false) {
		queryString += (firstWhere == true ? ' AND' : ' WHERE') + ' start_date < NOW()';
		firstWhere = true;
	}
	if (flags.get_current == false) {
		queryString += (firstWhere == true ? ' AND' : ' WHERE') + ' (start_date > NOW() OR end_date < NOW())'
	}

	// Ordering, Limits, Etc.
	queryString += ' ORDER BY start_date';
	if (flags['return_count']) {
		queryString += ' LIMIT ?';
		paramsArray.push(flags['return_count']);
	}

	queryString += ';';
	console.log('Query string formed: ' + queryString);

	if (paramsArray.length == 0) {
		query = connection.query(queryString);
	} else {
		query = connection.query(queryString, paramsArray);
	}

	query.on('error', function(err) { callback(null, 'SQL Error - ' + err); });
	query.on('result', function(result) {
		console.log('Competition data loaded for ' + result.name);
		resultArray[resultArray.length] = {
			id: result.id,
			name: result.name,
			start_date: result.start_date,
			end_date: result.end_date,
			is_private: result.is_private,
			problems: {}
		};
	});
	query.on('end', function() {
		console.log('All competition data loaded. Calling callback...');
		callback(resultArray);
	});
}

// Callback : result, err
function GenerateCompetitionPage_Admin(userData, compId, callback) {
	console.log('Creating competition page for admin, competition number: ' + compId);

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var query = connection.query('SELECT id, name, start_date, end_date, is_private FROM Competitions WHERE id = ? LIMIT 1;', compId);

	query.on('error', function(err) {
		callback(null, err);
	});
	query.on('result', function(result) {
		console.log('Found competition data: ' + result.name);
		var competitionData = {
			id: result.id,
			name: result.name,
			start_date: result.start_date,
			end_date: result.end_date,
			is_private: result.is_private[0],
			problems: {}
		};

		// Now, grab the problems attached to the competition...
		var problemQuery = connection.query('SELECT id, name FROM Problems WHERE competition_id = ?;', result.id);
		problemQuery.on('error', function(err) {
			callback(null, err);
		});
		problemQuery.on('result', function(res) {
			console.log('Found problem data: ' + res.name);
			competitionData.problems[res.id] = {
				id: res.id,
				name: res.name
			};
		});
		problemQuery.on('end', function() {
			console.log('Finished receiving problems...');
			
			// Generate page from competition data...
			var page = kokiriPage.KokiriPage({
				title: '(Kokiri) Competition - ' + competitionData.name,
				stylesheet: './style.css',
				header: kokiriHeader.KokiriHeader({
					titleText: competitionData.name,
					subtitleText: 'USU ACM Framework - V0.1 (Kokiri)',
					userInfo: kokiriUserTab.GenerateUserTab(userData)
				}),
				sidebar: competitionSidebar.GenerateSidebar(userData, competitionData),
				body: require('./competitionPageLoader').CreateBodyFromFragment(competitionData.id)
			}, function(err) {
				if (err) {
					console.log('Could not create competition page - ' + err);
				}
			});

			callback(page);
			connection.end();
		});
	});
}

function GenerateCompetitionPage_User(userData, compId, callback) {
	console.log('Generating page for user ' + userData.username + ', competition ' + compId);

	var connection = require('mysql').createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var query = connection.query('SELECT id, name, start_date, end_date, is_private FROM Competitions WHERE id = ? LIMIT 1;', compId);
	query.on('error', function(err) {
		callback(null, err);
		connection.end();
	});
	query.on('result', function(result) {
		console.log('Found competition data: ' + result.name);
		var competitionData = {
			id: result.id,
			name: result.name,
			start_date: result.start_date,
			end_date: result.end_date,
			is_private: result.is_private[0],
			problems: {}
		};

		// Now, grab the problems attached to the competition...
		getProblems(competitionData);
	});

	function getProblems(competitionData) {
		var query = connection.query('SELECT id, name FROM Problems WHERE competition_id = ?;', competitionData.id);
		query.on('error', function(err) {
			if (err) {
				connection.end();
				callback(null, err);	
			}
		});
		query.on('result', function(result) {
			console.log('Found problem data: ' + result.name);
			competitionData.problems[result.id] = {
				id: result.id,
				name: result.name
			};
		});
		query.on('end', function() {
			console.log('Finished receiving problems...');

			// Generate page from competition data...
			var page = kokiriPage.KokiriPage({
				title: '(Kokiri) Competition - ' + competitionData.name,
				stylesheet: './style.css',
				header: kokiriHeader.KokiriHeader({
					titleText: competitionData.name,
					subtitleText: 'USU ACM Framework - V0.1 (Kokiri)',
					userInfo: kokiriUserTab.GenerateUserTab(userData)
				}),
				sidebar: competitionSidebar.GenerateSidebar(userData, competitionData),
				body: require('./competitionPageLoader').CreateBodyFromFragment(competitionData.id)
			}, function(err) {
				if (err) {
					console.log('Could not create competition page - ' + err);
				}
			});

			callback(page);
			connection.end();
		});
	}
}

function GenerateRejectionPage(userData, compDesc, callback) {
	console.log('Generating rejection page');

	var page = kokiriPage.KokiriPage({
		title: '(Kokiri) Competition Framework',
		stylesheet: './style.css',
		header: kokiriHeader.KokiriHeader({
			titleText: 'Page Not Available',
			subtitleText: 'Visitor is not authorized to view this page at this time',
			userInfo: kokiriUserTab.GenerateUserTab(userData)
		}),
		sidebar: competitionSidebar.GenerateSidebarFromDesc(userData, compDesc, callback),
		body: {
			render: function(callback) {
				callback('You are not authorized to view this page at this time.');
			}
		}
	}, function(err) {
		if (err) {
			console.log('Error generating rejection page - ' + err);
		}
	});

	console.log('Sending back generated rejection page...');
	callback(page);
}

function IsUserAuthorized(userData, compDesc, callback) {

	console.log('Connecting to database, checking competition status...');

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var query = connection.query('SELECT name, start_date, end_date, is_private FROM Competitions WHERE id=?;',
		compDesc.n);
	query.on('error', function(err) {
		callback(false, 'Could not get competition data - SQL error ' + err);
	});
	query.on('result', function(result) {
		console.log('Found competition data - looking at dates...');
		
		// If start date is after current date, must be admin.
		if (Date.parse(result.start_date) > Date.now()) {
			if (!userData || userData.is_admin == false) {
				callback(false, 'Competition has not started, user is not admin.');
			} else {
				callback(true);
			}
		}
		// If is private, must be user
		else if (result.is_private[0]) {
			if (!userData) {
				callback(false, 'Competition has ended, but must be user to view (private competition)');
			} else {
				callback(true);
			}
		} else {
			callback(true);
		}
	});
	query.on('end', function() {
		connection.end(function(err) {
			if (err) {
				console.log('Error closing connection - ' + err);
			}
		});
	});
}

function GenerateCompetitionPage_Guest(compId, callback) {
	console.log('Generating page for a guest...');
	callback({
		render: function(callback) {
			callback('No page available to filthy guests!');
		}
	});
}

// TODO: Authorize user to see competition at this layer.
function GenerateCompetitionPage(userData, compDesc, callback) {
	console.log('User requesting competition page. Request:');
	console.log(compDesc);

	IsUserAuthorized(userData, compDesc, function(authd, msg) {
		if (msg) {
			console.log(msg);
		}

		if (authd == false) {
			console.log('User is not authorized');
			GenerateRejectionPage(userData, compDesc, callback);
		} else {
			console.log('User is authorized to view this competition');
			if (compDesc.p) {
				problems.GenerateProblemPage(userData, compDesc, callback);
			} else if (compDesc.s) {
				submission.GenerateSubmissionPage(userData, compDesc, callback);
			} else if (compDesc.type && compDesc.type == 'scores') {
				scoreboard.GenerateScoreboard(userData, compDesc, callback);
			} else if (compDesc.type && compDesc.type == 'submissions') {
				viewSubmissions.GenerateSubmissionPage(userData, compDesc, callback);
			} else {
				if (!userData) {
					GenerateCompetitionPage_Guest(compDesc.n, callback);
				} else if (userData.is_admin == true) {
					GenerateCompetitionPage_Admin(userData, compDesc.n, callback);
				} else {
					GenerateCompetitionPage_User(userData, compDesc.n, callback);
				}
			}
		}
	});
}

// This function grabs competition objects, sends them back
// competitionObject: type, data
//  type defines what type to be sent back.
//  data defines the actual data to be written.
// callback: function(competitionObject, err);
function GenerateCompetitionObject(userData, compObjectDesc, callback) {
	console.log('Requestion competition object:');
	console.log(compObjectDesc);

	// Class 1: Problem statements
	if (compObjectDesc.type = 'ProblemDescription') {
		// Make sure user is authorized to view the problem...
		IsUserAuthorized(userData, { n: compObjectDesc.competition_id },
			function(result, err) {
				if (result == false) {
					callback(null, err);
				} else {
					competitionPageLoader.GetRawProblemStatementData(compObjectDesc.competition_id,
						compObjectDesc.problem_id,
						function(raw_data, err) {
							if (err) {
								callback(null, err);
							} else {
								callback({
									type: 'application/pdf',
									data: raw_data
								});
							}
						});
				}
			});
	}
}

exports.GetListOfCompetitions = GetListOfCompetitions;
exports.GenerateCompetitionPage = GenerateCompetitionPage;
exports.GenerateCompetitionObject = GenerateCompetitionObject