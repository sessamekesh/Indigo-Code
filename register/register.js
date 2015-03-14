'use strict';

var generic_page = require('../page_builders/generic_page'),
	team_register = require('./team_register'),
	competition_dao = require('../dao/competition_dao'),
	error_page = require('../page_builders/error_page'),
	UPCOMING_TIMEFRAME = 60 * 60 * 24 * 7; // 7 days

exports.route = function (response, request, remainingPath) {
	if (remainingPath === undefined || remainingPath === '') {
		// Show page "Pick competition for which to register"
		generic_page.GoronPage({
			title: '(Goron) Register team',
			header: generic_page.GoronHeader({
				title: 'Create new team',
				subtitle: 'Select a competition',
				user_info: generic_page.GoronUserInfo(request.session.data.user)
			}),
			sidebar: generic_page.GoronSidebar(request.session.data.user),
			body: {
				render: function (callback) {
					// Get list of upcoming competitions and current competitions
					var comp_list = [];

					get_upcoming_comps();

					function get_upcoming_comps() {
						competition_dao.getUpcomingCompetitions(UPCOMING_TIMEFRAME, function (res, err) {
							if (err) {
								callback('Could not get upcoming competitions - ' + err);
							} else {
								console.log(res);
								comp_list = comp_list.concat(res);
								get_current_comps();
							}
						});
					}

					function get_current_comps() {
						competition_dao.getOngoingCompetitions(function (res, err) {
							if (err) {
								callback('Could not get ongoing competitions - ' + err);
							} else {
								console.log(res);
								comp_list = comp_list.concat(res);
								generate_page();
							}
						});
					}

					function generate_page() {
						var tr = '<ul>';
						console.log(comp_list);
						for (var i = 0; i < comp_list.length; i++) {
							tr += '\n\t<li><a href="/register/c' + comp_list[i].id + '">' + comp_list[i].name + '</a></li>';
						}
						tr += '</ul>';
						callback(tr);
					}
				}
			}
		}).render(function (data, err) {
			if (err) {
				error_page.ShowErrorPage(response, request, 'Could not render page', err);
			} else {
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(data);
				response.end();
			}
		});
	} else {
		if (/^\/[c]{1}\d+/.test(remainingPath)) {
			// Is it 'c##'? Then go on to the team_register thing
			competition_dao.getCompetitionData({ id: /^\/[c]{1}\d+/.exec(remainingPath)[0].substr(2) }, function (res, err) {
				if (err) {
					error_page.ShowErrorPage(response, request, 'Could not get competition data', err);
				} else {
					if (remainingPath.indexOf('/', 1) > 0) {
						remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
						team_register.route(response, request, res, remainingPath);
					} else {
						team_register.route(response, request, res);
					}
				}
			});
		} else {
			// Otherwise, show error page (for now)
			error_page.ShowErrorPage(response, request, 'No competition specified', 'No competition specified');
		}
	}
}

function validate_entry(userData, compData, callback) {
	callback(true);
}