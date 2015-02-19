'use strict';

var error_page = require('../page_builders/error_page'),
	competition_page = require('../page_builders/competition_page');

var comp_subsystem = {};

function route(response, request, compData, remainingPath) {
	console.log('scoreboard: Subsystem activated. Competition: ' + compData.name + '. Remaining Path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	// Begin routing...
	if (remainingPath && remainingPath !== '') {
		if (comp_subsystem[subsys_name]) {
			comp_subsystem[subsys_name].route(response, request, compData, remainingPath.substr(remainingPath.indexOf('/', 1)));
		} else {
			error_page.ShowErrorPage(response, request, '404 - Page Not Found', 'Subsystem ' + subsys_name + ' not found!');
		}
	} else {
		// Use vanilla scoreboard system...
		showScoreboard(response, request, compData);
	}
}

function showScoreboard(response, request, compData) {
	console.log('scoreboard: generating scoreboard page to show to user...');
	// Generate scoreboard for user...
	var scoreboard_page = competition_page.GoronCompetitionPage(request.session.data.user, compData, {
		render: function(callback) {
			callback('TESTING creation of scoreboard... Does it work?');
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