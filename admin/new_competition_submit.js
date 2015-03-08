'use strict';

var error_page = require('../page_builders/error_page'),
	querystring = require('querystring'),
	competition_dao = require('../dao/competition_dao'),
	generic_page = require('../page_builders/generic_page');

exports.route = function (response, request, remainingPath) {
	// Grab the shit, then redirect accordingly
	console.log('--- New Competition Submission Received ---');

	var submission_data = '';

	if (request.method != 'POST') {
		console.log('new_competition_submit: Post data not received');
		error_page.ShowErrorPage(response, request, 'Invalid Form Submission', 'No data received from form submission!');
	} else {
		request.on('data', function (data) {
			submission_data += data;
			if (submission_data.length > 1e5) {
				// Destroy connection, too much data!
				request.connection.destroy();
			}
		});

		request.on('end', function () {
			var form_data = querystring.parse(submission_data);
			
			competition_dao.addNewCompetition(form_data, function (result, err) {
				if (err) {
					error_page.ShowErrorPage(response, request, 'Insertion Failed!', 'No data was inserted, error: ' + err);
				} else {
					var page = generic_page.GoronPage({
						title: '(Goron) Add New Competition',
						header: generic_page.GoronHeader({
							title: 'Competition creation success!',
							subtitle: '',
							user_info: generic_page.GoronUserInfo(request.session.data.user)
						}),
						sidebar: generic_page.GoronSidebar(request.session.data.user),
						body: { render: function (cb) { cb('<p>New competition successfully created!</p>'); } }
					});
					if (page === undefined) {
						error_page.ShowErrorPage(response, request, 'Error generating page', 'There was an error generating the "submission success" page. But, the data successfully inserted.');
					} else {
						page.render(function (data, error) {
							if (error) {
								error_page.ShowErrorPage(response, request, 'Error rendering page (submission succeeded)', 'The submission was successful, but the page had an error rendering: ' + error);
							} else {
								response.writeHead(200, {'Content-Type': 'text/html'});
								response.write(data);
								response.end();
							}
						});
					}
				}
			});
		});
	}
};