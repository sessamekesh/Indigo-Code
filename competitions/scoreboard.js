'use strict';

var mysql = require('mysql'),
	kokiriPage = require('../kokiriPage'),
	kokiriHeader = require('../kokiriHeader'),
	kokiriUserTab = require('../kokiriUserTab'),
	competitionSidebar = require('./competitionSidebar');

// Scoreboard.js
function GenerateScoreboardBody(compID) {
	console.log('Generating score body...');
	return {
		// Callback: page_contents, err
		render: function(callback) {
			console.log('Rendering score body...');
			var toReturn = '';

			toReturn += '<table>'
				+ '\n\t<tr>'
				+ '\n\t\t<th>User</th>';

			// <th>Problem1</th><th>Problem2</th>...
			var connection = mysql.createConnection({
				user: 'kokiri',
				host: 'localhost',
				password: 'v1.0',
				database: 'kokiri'
			});

			var problemsQuery = connection.query('SELECT name FROM Problems WHERE competition_id = ? ORDER BY id;', compID);
			var problemsArray = [];
			problemsQuery.on('error', function(err) {
				if (err) {
					callback(null, 'Error in SQL: ' + err);
					connection.end();
				}
			});
			problemsQuery.on('result', function(result) {
				// Got a new result - add it to our list
				toReturn += '<th>' + result.name + '</th>';
				problemsArray.push(result.name);
			});
			problemsQuery.on('end', function() {
				toReturn += '\n\t</tr>';
				tallyUserResults();
			});

			// Tally all user results from SQL query, prepare to render them...
			function tallyUserResults() {
				var userResults = {};
				// This query was only found through much study and prayer.
				//  Alter only with great caution, for you may disturb the plans
				//  of a benevolent God.
				// Also, it's missing how long into the competition the problem
				//  was solved. That's totally in the SQL. TOOD: Add that.
				var queryText = 
					'SELECT Problems.name AS problem, '
					+ 'Users.username AS user, '
					+ '(COUNT(*) - 1) AS penalty '
					+ 'FROM ProblemSubmissions '
					+ 'LEFT JOIN Users ON ProblemSubmissions.user_id = Users.id '
					+ 'LEFT JOIN Problems ON ProblemSubmissions.problem_id = Problems.id '
					+ 'WHERE (SELECT COUNT(*) FROM ProblemSubmissions WHERE user_id = Users.id AND problem_id = Problems.id AND result = \'AC\') > 0 '
					+ 'AND submission_time <= (SELECT submission_time FROM ProblemSubmissions WHERE result = \'AC\' AND problem_id = Problems.id AND user_id = Users.id LIMIT 1) '
					+ ' AND Problems.competition_id = ? '
					+ 'GROUP BY username, problem;'
				console.log('Asking the big question:');
				console.log(queryText);
				var resultsQuery = connection.query(queryText, compID);
				resultsQuery.on('err', function(err) {
					if (err) {
						callback(null, 'Error in SQL getting results: ' + err);
						connection.end();
					}
				});
				resultsQuery.on('result', function(result) {
					console.log('New result:');
					console.log(result);
					if(!userResults[result.user]) {
						userResults[result.user] = {};
					}
					userResults[result.user][result.problem] = String(result.penalty);
				});
				resultsQuery.on('end', function() {
					console.log('User results read!');
					console.log(userResults);
					// Tally up solved problems
					for (var user in userResults) {
						var solved_count = 0;
						for (var solved in userResults[user]) {
							solved_count++;
						}
						userResults[user].solved_count = solved_count;
					}

					// Insert (sorted) into array
					var userArray = [], i = 0;
					for (var user in userResults) {
						for (i = 0; i < userArray.length && 
							(userResults[user].solved_count < userArray[i].solved_count);
							i++);
						userArray.splice(i, 0, {
							username: user,
							solved_count: userResults[user].solved_count
						});
						for (var problem in userResults[user]) {
							userArray[i][problem] = userResults[user][problem];
						}
					}

					console.log('User results sorted');
					console.log(userArray);

					outputUserScores(userArray);
				});
			}

			// Output user scores to the screen...
			function outputUserScores(userResultsArray) {
				for (var i = 0; i < userResultsArray.length; i++) {
					toReturn += '\n\t<tr>';
					toReturn += '\n\t\t<td>' + userResultsArray[i].username + ' (' + userResultsArray[i].solved_count + ')</td>';
					for(var j = 0; j < problemsArray.length; j++) {
						toReturn += '\n\t\t<td>';
						if(userResultsArray[i][problemsArray[j]]) {
							toReturn += '<b>SOLVED (-' + userResultsArray[i][problemsArray[j]] + ')</b>';
						}
						toReturn += '</td>';
					}
					toReturn += '\n\t</tr>';
				}
				toReturn += '\n</table>';
				connection.end();
				callback(toReturn);
			}
		}
	}
}

function GenerateScoreboard(userData, compDesc, callback) {
	var page = kokiriPage.KokiriPage({
		title: '(Kokiri) Competition Scores',
		stylesheet: './style.css',
		header: kokiriHeader.KokiriHeader({
			titleText: 'Scores for competition',
			subtitleText: 'Bad design made specifying <i>which</i> competition beyond the scope of this prototype',
			userInfo : kokiriUserTab.GenerateUserTab(userData)
		}),
		sidebar: competitionSidebar.GenerateSidebarFromDesc(userData, compDesc),
		body: GenerateScoreboardBody(compDesc.n)
	});
	callback(page);
}

exports.GenerateScoreboard = GenerateScoreboard;