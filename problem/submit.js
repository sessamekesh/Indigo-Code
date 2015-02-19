'use strict';

var competition_page = require('../page_builders/competition_page'),
	error_page = require('../page_builders/error_page'),
	language_dao = require('../dao/language_dao');

// NEXT VERSION: All subsystem console logs should have (1) user session ID,
//  (2) some visual identifier that a subsystem has been activated (::)
// Something similar should be done for DAO calls, etc.
// Also, can I write out to stderr?
function route(response, request, compData, problemData, remainingPath) {
	console.log('submit.js:: Submit subsystem activated');
	if (!remainingPath || remainingPath == '') {
		var page = competition_page.GoronCompetitionPage(request.session.data.user, compData, {
			render: generateSubmitPageBody(request.session.data.user, compData, problemData)
		});
		if (page) {
			page.render(function (content, err) {
				if (err) {
					console.log('submit.js: ERR generating submission page: ' + err);
					error_page.ShowErrorPage(response, request, 'Error generating submission form', 'There was an error generating the submission form. Please try again. If this problem persists, contact the administrators.');
				} else {
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(content);
					response.end();
				}
			});
		} else {
			error_page.ShowErrorPage(response, request, 'Could not generate submission form', 'Could not generate submission form - null object returned');
		}
	} else {
		console.log('submit.js: Showing error page, because remaining path was ' + remainingPath + ' (not empty)');
		error_page.ShowErrorPage(response, request, '404 Not Found', 'Could not find a page at this address');
	}
}

function generateSubmitPageBody(userData, compData, problemData) {
	return function (callback) {

		console.log('Rendering submission form for problem ' + problemData.name);

		var body = '<div id="content">'
			+ '\n\t<form action="/competition/c' + compData.id + '/p' + problemData.id + '/plea_to_the_gods_of_programming"'
				+ ' method="post" enctype="multipart/form-data">'
			+ '\n\t\t<h2 style="text-align: center">Submit Solution to ' + problemData.name + '</h2>'
			+ '\n\t\t<label for="language">Language:</label>'
			+ '\n\t\t<select name="language">';

		language_dao.getLanguageList(function (res, err) {
			if (err) {
				console.log('submit.js: Error getting language list: ' + err);
				callback(null, 'Could not generate list of languages available to competition.');
			} else {
				for (var i = 0; i < res.length; i++) {
					body += '\n\t\t\t<option value="' + res[i].id + '">' + res[i].name + '</option>';
				}
				inputFileSelect();
			}
		});

		function inputFileSelect() {
			body += '\n\t\t</select><br />'
				+ '\n\t\t<label for="submission_file">Submission File:</label>'
				+ '\n\t\t<input type="file" name="submission_file" multiple="multiple" /><br />'
				+ '\n\t\t<input type="submit" value="Submit" />'
				+ '\n\t</form>'
				+ '\n</div>';
			callback(body);
		}
	};
}

exports.route = route;