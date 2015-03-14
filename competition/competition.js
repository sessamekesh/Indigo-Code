'use strict';

var subsystem = {},
	comp_subsystem = {};

var error_page = require('../page_builders/error_page'),
	competition_dao = require('../dao/competition_dao'),
	competition_page = require('../page_builders/competition_page'),
	scoreboard = require('./scoreboard'),
	problem = require('../problem/problem.js'),
	team_dao = require('../dao/team_dao');

comp_subsystem['/scoreboard'] = scoreboard;

/* 	----------- Improvements for V0.3 -----------
	- Cache user authorization statuses - instead of hitting MySQL database each time
	++ Cache competitions in system itself (store for some time all data, check against cached values?)
*/

// Callback:
// callback(result, compData, authNodes, err)
// -result: true if authorized, false if not. compData will be null if not authorized
// -compData: Competition data { id, name, is_private, start_date, end_date }
// -authNotes: if compData is null, reason they were denied access
// -err: If an SQL error occurred, what the SQL error was
function gatekeeper(userData, compID, callback) {
	console.log('----------------------GATEKEEPER-----------------------');
	if (userData) {
		console.log('-- ' + (userData.is_admin ? 'SIR ' + userData.user_name : userData.user_name + ' THE PEASANT'));
	} else {
		console.log('-- FILTHY GUEST');
	}
	console.log('-- Requesting access to competition: ' + compID);
	console.log('------------JUDGE WISELY OH THOU HOLY JUDGE------------');

	competition_dao.getCompetitionData({ id: compID }, function(compData, err) {
		if (err) {
			console.log('Failed to get competition data on grounds: ' + err);
			callback(false, null, null, 'competition_dao error: ' + err);
		} else {
			if (compData) {
				if (!userData || userData === 'Guest' || userData === 'IncorrectLogin') {
					auth_guest(compData);
				} else if (!userData.is_admin) {
					auth_peasant(compData);
				} else {
					auth_admin(compData);
				}
			} else {
				// NEXT VERSION: Don't tell the callback (in the authNotes, which is client-facing)
				//  why they failed - just say they failed (otherwise people can guess competition IDs)
				callback(false, null, 'No competition found with given ID');
			}
		}
	});

	function auth_admin(compData) {
		console.log('Authorizing admin to competition...');
		console.log('Decision: pass (admin, duh. "Right this way, sir.")');
		callback(true, compData);
	}

	function auth_peasant(compData) {
		console.log('Authorizing peasant to competition...');
		// PASS:
		// Competition is expired (end_date < now)
		// Competition is ongoing (start_date < now < end_date)
		if (Date.parse(compData.end_date) < Date.now()) {
			console.log('Decision: pass (competition has expired)');
			callback(true, compData);
		} else if (Date.parse(compData.end_date) > Date.now() && Date.parse(compData.start_date) < Date.now()) {
			console.log('Decision: pass (competition is ongoing)');
			callback(true, compData);
		} else if (Date.parse(compData.start_date) > Date.now()) {
			console.log('Decision: reject (competition has not yet started)');
			var timeRemaining = Math.floor((compData.start_date.getTime() - Date.now()) / 1000);
			if (timeRemaining > 48 * 60 * 60) {
				callback(false, null, 'Access Denied - competition has not yet started!<br />Competition will not start for more than 24 hours.');
			} else {
				var secs = timeRemaining % 60,
					mins = Math.floor((timeRemaining - secs) / 60) % 60,
					hrs = Math.floor((timeRemaining - secs - (mins * 60)) / 360) % 24,
					secs_txt = ('00' + secs).slice(-2),
					mins_txt = ('00' + mins).slice(-2),
					hrs_txt = ('00' + hrs).slice(-2);
				callback(false, null, 'Access Denied - competition has not yet started.<br />'
					+ 'Competition will begin in ' + hrs_txt + ':' + mins_txt + ':' + secs_txt);
			}

		} else {
			console.log('Decision: reject (though we don\'t know why');
			callback(false, null, 'Access Denied (though we don\'t know why');
		}
	}

	function auth_guest(compData) {
		console.log('Authorizing filthy guest to competition...');
		if (Date.parse(compData.end_date) < Date.now() && compData.is_private == false) {
			console.log('Decision: pass (competition has expired and is public)');
			callback(true, compData);
		} else if (compData.is_private) {
			console.log('Decision: fail (competition is private)');
			callback(false, null, 'Access Denied (must be logged in to view this competition)');
		} else {
			console.log('Decision: fail (competition has not yet passed)');
			callback(false, null, 'Access denied (competition is ongoing - must be logged in to view!)');
		}
	}
}

function route(response, request, remainingPath) {
	console.log('Subsystem competition activated - remaining path: ' + remainingPath);

	request.session.data.lastPage = require('url').parse(request.url).pathname;

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	// Begin routing...
	if (remainingPath && remainingPath !== '') {
		// Check to see if the competition is specified...
		if (/^\/[c]{1}\d+/.test(remainingPath)) {
			console.log('Matches competition description. Checking authorization...');
			// There is a competition specified. Check authorization,
			//  route to subsystem if appropriate
			var compID = /^\/[c]{1}\d+/.exec(remainingPath)[0].substr(2);
			if (remainingPath.indexOf('/', 1) > 0) {
				remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
			} else {
				remainingPath = undefined;
			}
			var subsys_name = remainingPath;
			if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
				subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
			}
			gatekeeper(request.session.data.user, compID,
				function(result, compData, authNotes, err) {
					// Gather team data, commit to session variable
					//  If no team, provide error page with link to register team.
					if (compData !== undefined && compData !== null) {
						team_dao.getTeamData({ userID: request.session.data.user.id, compID: compData.id }, function (res, err) {
							if (err) {
								console.log('competition: Error getting team data: ' + err);
								error_page.ShowErrorPage(response, request, 'No team found', 'No team found with current information - register a team for this competition <a href="/register/c' + compData.id + '">here</a>');
							} else {
								request.session.data.team = res;
								dostuff();
							}
						});
					} else {
						dostuff();
					}

					function dostuff() {
						if (result) {
							// Check for forwarding to 'problems' subsystem...
							if (/^\/[p]{1}\d+/.test(remainingPath)) {
								var problemID = /^\/[p]{1}\d+/.exec(remainingPath)[0].substr(2);
								if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
									remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
								} else {
									remainingPath = undefined;
								}
								problem.route(response, request, compData, problemID, remainingPath);
							} else {
								if (subsys_name) {
									if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
										remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
									} else {
										remainingPath = undefined;
									}
									console.log('competition: Forwarding path out to subsystem ' + subsys_name);
									// Forward request out
									if (comp_subsystem[subsys_name]) {
										comp_subsystem[subsys_name].route(response, request, compData, remainingPath);
									} else {
										console.log('Subsystem ' + subsys_name + ' not found!');
										response.writeHead(404, {'Content-Type': 'text/plain'});
										response.write('404 not found! (Subsystem - competition)');
										response.end();
									}
								} else {
									// Just generate competition page
									var comp_page = competition_page.GoronCompetitionPage(request.session.data.user, request.session.data.team, compData);
									if (comp_page) {
										comp_page.render(function (data, err) {
											if (err) {
												error_page.ShowErrorPage(response, request, 'Error Generating Competition Page', 'Error generating competition page: ' + err);
											} else {
												console.log('competition.js: Sending response for competition');
												response.writeHead(300, {'Content-Type': 'text/html'});
												response.write(data);
												response.end();
											}
										});
									} else {
										error_page.ShowErrorPage(response, request, 'Error Generating Competition Page', 'Could not generate competition page builder');
									}
								}
							}
						} else {
							if (err) {
								console.log('competition: Error authorizing user: ' + err);
								error_page.ShowErrorPage(response, request, 'User Not Authorized',
									'There was an unexpected error attempting to authorize the current user. '
									+ 'The error itself was unexpected, so I\'m afraid I can\'t share the details of it '
									+ 'with you, this being an early and untested prototype.');
							} else {
								console.log('competition: User rejected from competition subsystem: ' + authNotes);
								// Generate rejection page
								error_page.ShowErrorPage(response, request, 'User Not Authorized', authNotes);
							}
						}
					}
				});
		} else {
			// Check against subsystems in the regular fashion.
			//  This is for static competition pages.
			if (subsystem[subsys_name]) {
				console.log('Forwarding request to subsystem ' + subsys_name);
				if (remainingPath.indexOf('/', 1) > 0) {
					subsystem[subsys_name].route(response, request, remainingPath.substr(remainingPath.indexOf('/', 1)));
				} else {
					subsystem[subsys_name].route(response, request);
				}
			} else {
				console.log('Subsystem ' + subsys_name + ' not found!');
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 not found! (Subsystem - competition)');
				response.end();
			}
		}
	} else {
		console.log('Action not found. Reporting 404 (user)');
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('404 not found! (Subsystem - competition)');
		response.end();
	}
}

exports.route = route;