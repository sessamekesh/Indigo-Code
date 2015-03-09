'use strict';

var subsystem = {
	'/submit': require('./new_competition_submit')
};

var error_page = require('../page_builders/error_page'),
	generic_page = require('../page_builders/generic_page'),
	competition_data_form = require('./competition_data_form');

exports.route = function (response, request, remainingPath) {
	console.log('new_competition: Subsystem activated');
	if (remainingPath === undefined || remainingPath === '') {
		// Do new subsystem stuff here.
		showNewCompetitionPage(response, request);
	} else {
		console.log('new_competition: There is a remaining path, ' + remainingPath);
		// If there is a remaining path, find it
		var subsys_path = remainingPath;
		if (remainingPath.indexOf('/', 1) > 0) {
			subsys_path = remainingPath.substr(0, remainingPath.indexOf('/', 1));
			remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1) + 1);
		} else {
			remainingPath = undefined;
		}

		if (subsystem[subsys_path] === undefined) {
			// Subsystem is undefined, 404
			error_page.ShowErrorPage(response, request, '404 - Page Not Found', 'Subsystem ' + subsys_path + ' not found!');
		} else {
			// Subsystem is defined, route to it.
			subsystem[subsys_path].route(response, request, remainingPath);
		}
	}
};

function showNewCompetitionPage(response, request) {
	var page = generic_page.GoronPage({
		title: '(Goron) Create a new competition',
		header: generic_page.GoronHeader({
			title: 'Create new competition',
			subtitle: 'Version 0.2 (Goron)',
			user_info: generic_page.GoronUserInfo(request.session.data.user)
		}),
		sidebar: generic_page.GoronSidebar(request.session.data.user),
		body: competition_data_form.generateFormBody()
	});

	if (page === undefined) {
		console.log('new_competition: could not create page object');
		error_page.ShowErrorPage(response, request, 'Internal Error', 'Failed to generate page on subsystem new_competition');
	} else {
		page.render(function (w, err) {
			if (err) {
				console.log('new_competition: could not render page');
				error_page.ShowErrorPage(response, request, 'Error Generating Page', err);
			} else {
				console.log('new_competition: have data, showing it');
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(w);
				response.end();
			}
		});
	}
}