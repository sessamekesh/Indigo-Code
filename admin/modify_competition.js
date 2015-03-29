'use strict';

var subsystem = {
},

comp_subsystem = {
	'/submit': require('./modify_competition_submit'),
	'/delete': require('./delete_competition_submit'),
	'/add_problem': require('./new_problem')
};

var error_page = require('../page_builders/error_page'),
	generic_page = require('../page_builders/generic_page'),
	modify_competition_form = require('./modify_competition_form'),
	competition_dao = require('../dao/competition_dao');

exports.route = function (response, request, remainingPath) {
	console.log('modify_competition: Subsystem activated');

	if (remainingPath === undefined || remainingPath === '') {
		// Invalid - no competition number
		error_page.ShowErrorPage(response, request, 'No competition defined', 'Cannot modify competition - invalid URL path');
	} else if (/^\/[c]{1}\d+/.test(remainingPath)) {
		// Extract competition ID
		var compID = /^\/[c]{1}\d+/.exec(remainingPath)[0].substr(2);

		console.log('modify_competition: Competition entered: ' + compID);

		// Send off now to next system! But, with the data for that competition
		competition_dao.getCompetitionData({ id: compID }, function (compData, err) {
			if (err) {
				console.log('modify_competition: ERR Failed to get competition data: ' + err);
				error_page.ShowErrorPage(response, request, 'Could not get competition data', 'Could not get competition data for competition ' + compID + ': ' + err);
			} else {
				if (compData) {
					if (remainingPath.indexOf('/', 1) > 0) {
						remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
					} else {
						remainingPath = undefined;
					}
					route_specific_competition(response, request, remainingPath, compData);
				} else {
					error_page.ShowErrorPage(response, request, 'No competition data returned', 'No competition data returned for competition ' + compID);
				}
			}
		});
	} else {
		console.log('modify_competition: There is a remaining path, ' + remainingPath);
		// If there is a remaining path, find it
		var subsys_path = remainingPath;
		if (remainingPath.indexOf('/', 1) > 0) {
			subsys_path = remainingPath.substr(0, remainingPath.indexOf('/', 1));
			remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
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

function route_specific_competition (response, request, remainingPath, compData) {
	console.log('modify_competition: Subsystem for competition ' + compData.name + ' activated');
	if (remainingPath === undefined || remainingPath === '') {
		// We're modifying this competition. Own it.
		showModifyCompetitionPage(response, request, compData);
	} else {
		var subsys_path = remainingPath;
		if (remainingPath.indexOf('/', 1) > 0) {
			subsys_path = remainingPath.substr(0, remainingPath.indexOf('/', 1));
			remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
		} else {
			remainingPath = undefined;
		}

		if (comp_subsystem[subsys_path] === undefined) {
			error_page.ShowErrorPage(response, request, '404 - Page Not Found', 'Subsystem ' + subsys_path + ' not found!');
		} else {
			comp_subsystem[subsys_path].route(response, request, remainingPath, compData);
		}
	}
}

function showModifyCompetitionPage(response, request, compData) {
	var page = generic_page.GoronPage({
		title: '(Goron) Modify an existing competition',
		header: generic_page.GoronHeader({
			title: 'Modify competition ' + compData.name,
			subtitle: 'Version 0.2 (Goron)',
			user_info: generic_page.GoronUserInfo(request.session.data.user)
		}),
		sidebar: generic_page.GoronSidebar(request.session.data.user),
		body: modify_competition_form.generateFormBody(compData)
	});

	if (page === undefined) {
		console.log('modify_competition: could not create page object');
		error_page.ShowErrorPage(response, request, 'Internal Error', 'Failed to generate page object for competition ' + compData.name);
	} else {
		page.render(function (w, err) {
			if (err) {
				console.log('modify_competition: could not render page');
				error_page.ShowErrorPage(response, request, 'Error generating page', err);
			} else {
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(w);
				response.end();
			}
		});
	}
}