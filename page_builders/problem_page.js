'use strict';

var competition_page = require('./competition_page'),
	problem_dao = require('../dao/problem_dao'),
	fs = require('fs');

// NEXT VERSION: Instead of just generating these page objects,
//  also include 'safe methods' for their use.

// Is a competition page, except the body is filled instead
//  with problem data.
function GoronProblemPage(userData, teamData, compData, problemData) {
	console.log('problem_page: Generating page for problem ' + problemData.id);
	return competition_page.GoronCompetitionPage(userData, teamData, compData, {
		render: function(callback) {
			callback('<div id="content"><object width="100%" height="1200px" data="/competition/c' + compData.id + '/p' + problemData.id + '/desc">'
				+ '<p>Your browser does not support HTML5 object tags - access the problem statement'
				+ '<a href="/competition/c' + compData.id + '/p' + problemData.id + '/desc">here</a></p></object></div>');
		}
	});
}

exports.GoronProblemPage = GoronProblemPage;