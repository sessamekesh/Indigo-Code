'use strict';

var error_page = require('../page_builders/error_page'),
	competition_page = require('../page_builders/competition_page'),
	scores_dao = require('../dao/scores_dao'),
	problem_dao = require('../dao/problem_dao');

var comp_subsystem = {};

function route(response, request, compData, remainingPath) {
	console.log('scoreboard: Subsystem activated. Competition: ' + compData.name + '. Remaining Path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	// Begin routing...
	if (remainingPath === undefined || remainingPath === '' || remainingPath === '/') {
		// Use vanilla scoreboard system...
		showScoreboard(response, request, compData, 0);
	} else if (/\/\d+/.test(remainingPath)) {
		// Use vanilla scoreboard system, but pass in different page number
		showScoreboard(response, request, compData, (/\/\d+/.exec(remainingPath)).toString().substr(1));
	} else {
		if (comp_subsystem[subsys_name]) {
			comp_subsystem[subsys_name].route(response, request, compData, remainingPath.substr(remainingPath.indexOf('/', 1)));
		} else {
			error_page.ShowErrorPage(response, request, '404 - Page Not Found', 'Subsystem ' + subsys_name + ' not found!');
		}
	}
}

function showScoreboard(response, request, compData, pageNumber) {
	console.log('scoreboard: generating scoreboard page to show to user...');
	// Generate scoreboard for user...
	var start = pageNumber * 25,
		finish = (pageNumber + 1) * 25,
		scoreboard_page = competition_page.GoronCompetitionPage(request.session.data.user, compData, {
		render: function(callback) {
			var toCallback = '';

			scores_dao.getScoreboardData(compData, start, finish, function (res, err) {
				if (err) {
					console.log('scoreboard: ERR on getting scoreboard data: ' + err);
					callback(null, 'ERR retrieving SQL data: ' + err);
				} else {
					generateTableHeader(res);
				}
			});

			function generateTableHeader(scores_data) {
				toCallback += '<table>'
					+'\n\t<tr>'
					+ '\n\t\t<th>User</th>';
				problem_dao.getProblemsInCompetition(compData.id, function (res, err) {
					if (err) {
						callback(null, 'ERR generating table header: ' + err);
					} else {
						for (var i = 0; i < res.length; i++) {
							toCallback += '<th>' + res[i].name + '</th>';
						}
						toCallback += '\n\t</tr>';
						generateTableBody(scores_data, res);
					}
				});
			}

			function generateTableBody(scores_data, problems_list) {
				for (var i = 0; i < scores_data.length; i++) {
					toCallback += '\n\t<tr>'
						+ '\n\t\t<td>' + scores_data[i].user_name + '</td>';
					for (var j = 0; j < problems_list.length; j++) {
						toCallback += '<td></td>';
					}
				}
				callback(toCallback);
			}
		}
	});

	if (!scoreboard_page) {
		error_page.ShowErrorPage(response, request, 'Internal Error', 'Could not generate scoreboard page object - check logs');
	} else {
		scoreboard_page.render(function (content, err) {
			if (err) {
				console.log('scoreboard: Error rendering scoreboard: ' + err);
				error_page.ShowErrorPage(response, request, 'Rendering Error', 'Error rendering scoreboard_page. Check logs');
			} else {
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(content);
				response.end();
			}
		});
	}
}

exports.route = route;