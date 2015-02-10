'use strict';

var mysql = require('mysql'),
	kokiriPage = require('../kokiriPage'),
	kokiriHeader = require('../kokiriHeader'),
	kokiriUserTab = require('../kokiriUserTab'),
	competitionSidebar = require('./competitionSidebar');

function GenerateSubmissionsBody(compID) {
	console.log('Generating submissions body...');
	return {
		render: function(callback) {
			console.log('Rendering submissions body...');

			var toReturn = '';
			toReturn += '<table>'
				+ '\n\t<tr>'
				+ '\n\t\t<th>User</th><th>Problem</th><th>Language</th><th>Result</th><th>Reason</th>'
				+ '\n\t</tr>';

			// User, Problem, Language, Result, Notes
			var connection = mysql.createConnection({
				user: 'kokiri',
				host: 'localhost',
				password: 'v1.0',
				database: 'kokiri'
			});

			var queryText = 'SELECT Users.username, Languages.lang_name, '
				+ 'Problems.name AS problem_name, result, notes '
				+ 'FROM ProblemSubmissions '
				+ 'LEFT JOIN Users ON Users.id = user_id '
				+ 'LEFT JOIN Languages ON Languages.id = lang_id '
				+ 'LEFT JOIN Problems ON Problems.id = problem_id '
				+ 'WHERE Problems.competition_id = ? '
				+ 'ORDER BY submission_time DESC;';

			var submissionsQuery = connection.query(queryText, compID);

			submissionsQuery.on('error', function(err) {
				if (err) {
					console.log('Error in querying for submissions: ' + err);
				}
			});
			submissionsQuery.on('result', function(result) {
				console.log('Result received');
				console.log(result);
				toReturn += '\n\t<tr>';
				toReturn += '\n\t\t<td>' + result.username
						+ '</td><td>' + result.problem_name
						+ '</td><td>' + result.lang_name
						+ '</td><td>' + result.result
						+ '</td><td>' + result.notes
						+ '</td>';
				toReturn += '\n\t</tr>';
			});
			submissionsQuery.on('end', function() {
				connection.end();
				toReturn += '\n</table>';
				callback(toReturn);
			});
		}
	}
}

function GenerateSubmissionPage(userData, compDesc, callback) {
	console.log('Generating submission page...');

	var page = kokiriPage.KokiriPage({
		title: '(Kokiri) Submissions',
		stylesheet: './style.css',
		header: kokiriHeader.KokiriHeader({
			titleText: 'Submissions for competition',
			subtitleText: 'Due to bad design, <i>which</i> competition is unavailable',
			userInfo: kokiriUserTab.GenerateUserTab(userData)
		}),
		sidebar: competitionSidebar.GenerateSidebarFromDesc(userData, compDesc),
		body: GenerateSubmissionsBody(compDesc.n)
	});
	callback(page);
}

exports.GenerateSubmissionPage = GenerateSubmissionPage;