'use strict';

var mysql = require('mysql'),
	kokiriPage = require('../kokiriPage'),
	kokiriHeader = require('../kokiriHeader'),
	kokiriUserTab = require('../kokiriUserTab'),
	competitionSidebar = require('./competitionSidebar'),
	submitAnswer = require('../forms/submitAnswer');

function GenerateSubmissionPage(userData, compDesc, callback) {
	console.log('User requesting submission for problem');
	console.log(compDesc);

	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var problemTitle = 'ERROR FETCHING PROBLEM TITLE', languagesAllowed = [];
	var query = connection.query('SELECT Languages.id AS lang_id, Problems.name AS problem_name, lang_name, lang_command FROM ProblemLanguages'
		+ ' JOIN Problems ON problem_id = Problems.id'
		+ ' JOIN Languages ON language_id = Languages.id'
		+ ' WHERE Problems.id = ?;', compDesc.s);
	query.on('error', function(err) {
		console.log('Error generating submission page on fetching languages allowed: ' + err);
		callback(null, err);
	});
	query.on('result', function(result) {
		problemTitle = result.problem_name;
		languagesAllowed.push({ id: result.lang_id, name: result.lang_name, cmd: result.lang_command });
	});
	query.on('end', function() {
		console.log('Finished receiving problem details. Creating submit page...');
		console.log('Languages Allowed:');
		console.log(languagesAllowed);
		connection.end();

		var page = kokiriPage.KokiriPage({
			title: '(Kokiri) - Submit Solution for ' + problemTitle,
			stylesheet: './style.css',
			header: kokiriHeader.KokiriHeader({
				titleText: problemTitle,
				subtitleText: 'Submit',
				userInfo: kokiriUserTab.GenerateUserTab(userData)
			}),
			sidebar: competitionSidebar.GenerateSidebarFromDesc(userData, compDesc),
			body: submitAnswer.GenerateSubmissionForm(userData, compDesc, languagesAllowed)
		}, function(err) {
			if (err) {
				console.log('Could not create submit page - ' + err);
			}
		});

		callback(page);
	});
}

exports.GenerateSubmissionPage = GenerateSubmissionPage;