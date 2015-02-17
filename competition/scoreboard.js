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
			var errPage = error_page.GoronErrorPage(request.session.data.user,
				'404 - Page Not Found', 'Subsystem ' + subsys_name + ' not found!');
			if (errPage) {
				errPage.render(function (content, err) {
					if (err) {
						console.log('scoreboard: could not generate 404 error page: ' + err);
						response.writeHead(404, {'Content-Type': 'text/plain'});
						response.write('404 not found! (competition ' + compData.id + ' scoreboard)');
						response.end();
					} else {
						response.writeHead(300, {'Content-Type': 'text/html'});
						response.write(content);
						response.end();
					}
				});
			} else {
				console.log('scoreboard: Could not generate error page! Showing manual fail...');
				response.writeHead(300, {'Content-Type': 'text/plain'});
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 not found! (competition ' + compData.id + ' scoreboard)');
				response.end();
			}
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
		// NEXT VERSION: The 'Error Page' object is awkward to do full validation on,
		//  try to make it a bit more elegant?
		error_page.GoronErrorPage(request.session.data.user,
			'Internal Error', 'Could not generate scoreboard page object - check logs')
		.render(function (content, err) {
			if (err) {
				console.log('scoreboard: Could not generate scoreboard: ' + err);
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 not found! (competition ' + compData.id + ' scoreboard)');
				response.end();
			} else {
				console.log('scoreboard: Displaying scoreboard...');
				response.writeHead(300, {'Content-Type': 'text/html'});
				response.write(content);
				response.end();
			}
		});
	}
}

exports.route = route;