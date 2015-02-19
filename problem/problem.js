'use strict';

var problem_page = require('../page_builders/problem_page'),
	problem_dao = require('../dao/problem_dao'),
	error_page = require('../page_builders/error_page'),
	fs = require('fs'),
	submit = require('./submit'),
	judge = require('../submission/judge');

// prob_subsystem: response, request, compData, problemData, remainingPath
var prob_subsystem = {
	'/submit': submit,
	'/plea_to_the_gods_of_programming': judge // This is where you put submission receival
};

function route(response, request, compData, problemID, remainingPath) {
	console.log('problem.js: Routing request for problem ' + compData.id + ':' + problemID);

	if (!remainingPath || remainingPath === '') {
		showProblemPage(response, request, compData, problemID);
	} else if (remainingPath.indexOf('/desc') == 0) {
		// Load an asset...
		loadProblemDescription(response, request, problemID);
	} else {
		var subsys_path = remainingPath;
		if (subsys_path.indexOf('/', 1) > 0) {
			subsys_path = remainingPath.substr(0, subsys_path.indexOf('/', 1));
			remainingPath = remainingPath.substr(subsys_path.indexOf('/', 1));
		} else {
			remainingPath = undefined;
		}

		problem_dao.getProblemData(problemID, function (problemData, err) {
			if (err) {
				console.log('problem.js: Could not load page because of error in DAO: ' + err);
				error_page.ShowErrorPage(response, request, 'Internal Data Error', 'Internal Data error, could not load page - please check logs');
			} else {
				if (prob_subsystem[subsys_path]) {
					console.log('--- Subysstem Path: ' + subsys_path);
					console.log('--- Remaining Path: ' + remainingPath);
					prob_subsystem[subsys_path].route(response, request, compData, problemData, remainingPath);
				} else {
					error_page.ShowErrorPage(response, request, '404 Not Found', 'Could not find the file specified');
				}
			}
		});
	}
}

function showProblemPage(response, request, compData, problemID) {
	console.log('problem.js: Displaying problem page for problem ID ' + problemID);

	// Get problem data
	problem_dao.getProblemData(problemID, function(res, err) {
		if (err) {
			// NEXT VERSION: Don't so loosely give away information like this.
			error_page.ShowErrorPage(response, request, 'Error Retrieving Problem Data', err);
		} else {
			GeneratePage(res);
		}
	});

	// Generate page
	function GeneratePage(problemData) {
		var page = problem_page.GoronProblemPage(request.session.data.user, compData, problemData);
		if (!page) {
			// NEXT VERSION: Whenever you have a 'check logs' thing, also write out last whatever lines to file
			error_page.ShowErrorPage(response, request, 'Error Generating Problem Page', 'Could not generate problem page - returned empty object. Check logs.');
		} else {
			RenderPage(page);
		}
	}

	// Render page
	function RenderPage(pageObject) {
		pageObject.render(function (content, err) {
			if (err) {
				error_page.ShowErrorPage(response, request, 'Error rendering problem page', err);
			} else {
				console.log('problem.js: Sending header for problem page');
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(content);
				response.end();
			}
		});
	}
}

function loadProblemDescription(response, request, problemID) {
	console.log('problem.js: Loading problem description for : ' + problemID);
	problem_dao.getProblemData(problemID, function(problemData, err) {
		if (err) {
			console.log('problem.js: SQL Error loading problem data: ' + err.toString());
			error_page.ShowErrorPage(response, request, 'Could not load asset', 'Could not load problem description!');
		} else {
			fs.readFile('./data/problem_descriptions/' + problemData.desc_path, function (err, data) {
				if (err) {
					console.log('problem.js: ERR opening file in local directory: ' + err);
					error_page.ShowErrorPage(response, request, '404 - Could not load asset', 'Could not load requested asset!');
				} else {
					response.writeHead(200, {'Content-Type': problemData.content_type});
					response.write(data);
					response.end();
				}
			});
		}
	});
}

exports.route = route;