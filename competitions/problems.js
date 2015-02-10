'use strict';

var kokiriPage = require('../kokiriPage'),
	kokiriHeader = require('../kokiriHeader'),
	kokiriUserTab = require('../kokiriUserTab'),
	competitionSidebar = require('./competitionSidebar'),
	mysql = require('mysql'),
	competitionPageLoader = require('./competitionPageLoader');

// Callback format: [competitionsArray], err
// Optional flags:
//  competition_id: which competition for which to grab the problems
//  TODO: sample_only: 1 for only sample questions, 0 for all questions
function GetListOfProblems(flags, callback) {
	console.log('Generating list of problems...');
	console.log(flags);
	var connection = require('mysql').createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	if (!flags || !flags.competition_id) {
		callback(null, 'No competition ID provided!');
		return;
	}

	console.log('Getting list of problems for competition ' + flags.competition_id);

	var query, resultArray = [];

	query = connection.query('SELECT id, name FROM Problems WHERE competition_id = ?;', flags.competition_id);

	query.on('error', function(err) { callback(null, 'SQL Error - ' + err); });
	query.on('result', function(result) {
		console.log('Problem data loaded for ' + result.name);
		resultArray[resultArray.length] = {
			id: result.id,
			name: result.name
		};
	});
	query.on('end', function() {
		console.log('All problem data loaded. Calling callback...');
		callback(resultArray);
		connection.end(function(err) {
			console.log('Error ending connection - ' + err);
		});
	});
}

function GenerateProblemPage_Admin(userData, compDesc, callback) {
	console.log('Generating admin problem page');

	// Get competition data, problem data
	var comp_connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var remainingQueries = 2;

	var comp_query = comp_connection.query('SELECT id, name, start_date, end_date, is_private FROM Competitions WHERE id = ? LIMIT 1;', compDesc.n);
	comp_query.on('error', function(err) {
		callback(null, err);
	});
	comp_query.on('result', function(result) {
		console.log('Found competition data for: ' + result.name);
		var competitionData = {
			id: result.id,
			name: result.name,
			start_date: result.start_date,
			end_date: result.end_date,
			is_private: result.is_private[0],
			problems: {}
		};

		// Now, grab the problems...
		var problem_query = comp_connection.query('SELECT id, name FROM Problems WHERE competition_id = ?;', result.id);;
		problem_query.on('error', function(err) {
			callback(null, err);
		});
		problem_query.on('result', function(result) {
			console.log('Found problem data: ' + result.name);
			competitionData.problems[result.id] = {
				id: result.id,
				name: result.name
			}
		});
		problem_query.on('end', function() {
			console.log('Finished receiving problems. Creating problem page...');

			var page = kokiriPage.KokiriPage({
				title: '(Kokiri) ' + competitionData.problems[compDesc.p].name,
				stylesheet: './style.css',
				header: kokiriHeader.KokiriHeader({
					titleText: competitionData.problems[compDesc.p].name,
					subtitleText: 'USU ACM Framework - V0.1 (Kokiri)',
					userInfo: kokiriUserTab.GenerateUserTab(userData)
				}),
				sidebar: competitionSidebar.GenerateSidebar(userData, competitionData),
				body: competitionPageLoader.CreateBodyForProblem(compDesc.n, compDesc.p)
			}, function(err) {
				if (err) {
					console.log('Could not create problem page - ' + err);
				}
			});

			remainingQueries--;
			if(remainingQueries == 0) {
				comp_connection.end(function(err) {
					console.log('Error ending connection - ' + err);
				});
			}

			callback(page);
		});
	});

	comp_query.on('end', function() {
		remainingQueries--;
		if(remainingQueries == 0) {
			comp_connection.end(function(err) {
				console.log('Error ending connection - ' + err);
			});
		}
	});
}

function GenerateProblemPage_User(userData, compDesc, callback) {
	console.log('Generating user problem page');
	console.log(compDesc);

	// Get competition data, problem data.
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var comp_query = connection.query('SELECT id, name, start_date, end_date, is_private FROM Competitions WHERE id = ? LIMIT 1;', compDesc.n);
	comp_query.on('error', function(err) {
		callback(null, err);
		connection.end();
	});
	comp_query.on('result', function(result) {
		console.log('Found competition data - ' + result.name);
		var competitionData = {
			id: result.id,
			name: result.name,
			start_date: result.start_date,
			end_date: result.end_date,
			is_private: result.is_private[0],
			problems: {}
		};

		// Now, grab the problems...
		getProblems(competitionData);
	});

	function getProblems(competitionData) {
		var problem_query = connection.query('SELECT id, name FROM Problems WHERE competition_id = ' + competitionData.id);
		problem_query.on('error', function(err) {
			callback(null, err);
		});
		problem_query.on('result', function(result) {
			console.log('Found problem data for ' + result.name);
			competitionData.problems[result.id] = {
				id: result.id,
				name: result.name
			}
		});
		problem_query.on('end', function() {
			console.log('Finished receiving problems. Creating user problem page...');
			var page = kokiriPage.KokiriPage({
				title: '(Kokiri) ' + competitionData.problems[compDesc.p].name,
				stylesheet: './style.css',
				header: kokiriHeader.KokiriHeader({
					titleText: competitionData.problems[compDesc.p].name,
					subtitleText: 'USU ACM Framework - V0.1 (Kokiri)',
					userInfo: kokiriUserTab.GenerateUserTab(userData)
				}),
				sidebar: competitionSidebar.GenerateSidebar(userData, competitionData),
				body: competitionPageLoader.CreateBodyForProblem(compDesc.n, compDesc.p)
			}, function(err) {
				if (err) {
					console.log('Could not create problem page - ' + err);
				}
			});

			connection.end();
			callback(page);
		});
	}
}

function GenerateProblemPage_Guest(compDesc, callback) {

}

// function GenerateRejectionPage(userData, compDesc, callback) {
// 	console.log('Generating rejection page');

// 	var page = kokiriPage.KokiriPage({
// 		title: '(Kokiri) Competition Framework',
// 		stylesheet: './style.css',
// 		header: kokiriHeader.KokiriHeader({
// 			titleText: 'Page Not Available',
// 			subtitleText: 'Visitor is not authorized to view this page at this time',
// 			userInfo: kokiriUserTab.GenerateUserTab(userData)
// 		}),
// 		sidebar: competitionSidebar.GenerateSidebar(userData, compDesc),
// 		body: {
// 			render: function(callback) {
// 				callback('You are not authorized to view this page at this time.');
// 			}
// 		}
// 	}, function(err) {
// 		if (err) {
// 			console.log('Error generating rejection page - ' + err);
// 		}
// 	});

// 	console.log('Sending back generated rejection page...');
// 	callback(page);
// }

// function IsUserAuthorized(userData, compDesc, callback) {

// 	console.log('Connecting to database, checking competition status...');

// 	var connection = mysql.createConnection({
// 		host: 'localhost',
// 		user: 'kokiri',
// 		password: 'v1.0',
// 		database: 'kokiri'
// 	});

// 	var query = connection.query('SELECT name, start_date, end_date, is_private FROM Competitions WHERE id=?;',
// 		compDesc.n);
// 	query.on('error', function(err) {
// 		callback(false, 'Could not get competition data - SQL error ' + err);
// 	});
// 	query.on('result', function(result) {
// 		console.log('Found competition data - looking at dates...');
		
// 		// If start date is after current date, must be admin.
// 		if (Date.parse(result.start_date) > Date.now()) {
// 			if (!userData || userData.is_admin == false) {
// 				callback(false, 'Competition has not started, user is not admin.');
// 			} else {
// 				callback(true);
// 			}
// 		}
// 		// If is private, must be user
// 		else if (result.is_private[0]) {
// 			if (!userData) {
// 				callback(false, 'Competition has ended, but must be user to view (private competition)');
// 			} else {
// 				callback(true);
// 			}
// 		} else {
// 			callback(true);
// 		}
// 	});
// 	query.on('end', function() {
// 		connection.end(function(err) {
// 			if (err) {
// 				console.log('Error closing connection - ' + err);
// 			}
// 		});
// 	});
// }

function GenerateProblemPage(userData, compDesc, callback) {
	// Route request to appropriate spot...
	// For instance, if userData is not admin and the competition hasn't started yet,
	//  give an error message that the user is not authorized (countdown to competition)
	console.log('User requesting problem ' + compDesc.p + ', competition ' + compDesc.n);
	if (!userData) {
		GenerateProblemPage_Guest(compDesc, callback);
	} else if (userData.is_admin == true) {
		GenerateProblemPage_Admin(userData, compDesc, callback);
	} else {
		GenerateProblemPage_User(userData, compDesc, callback);
	}
}

exports.GetListOfProblems = GetListOfProblems;
exports.GenerateProblemPage = GenerateProblemPage;