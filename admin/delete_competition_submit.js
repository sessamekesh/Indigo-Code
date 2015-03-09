'use strict';

var error_page = require('../page_builders/error_page'),
	querystring = require('querystring'),
	competition_dao = require('../dao/competition_dao'),
	generic_page = require('../page_builders/generic_page');

exports.route = function (response, request, remainingPath, compData) {
	console.log('--- Delete Competition Submission Received ---');

	var submission_data = '';
	if (request.method != 'POST') {
		// TODO KIP: Security flaw: This may activate if post data is manually sent (javascript)
		//  But I mean, whatever. Admins have power to screw everything anyways
		console.log('delete_competition_submit: Post data not received!');
		error_page.ShowErrorPage(response, request, 'Invalid Form Submission', 'No data received!');
	} else {
		request.on('data', function (data) {
			submission_data += data;
			if (submission_data.length > 1e5) {
				// Too much data! Get rid of!
				request.connection.destroy();
			}
		});

		request.on('end', function() {
			var form_data = querystring.parse(submission_data);

			competition_dao.deleteCompetition(compData.id, function (res, err) {
				if (err) {
					error_page.ShowErrorPage(response, request, 'Deletion failed!', 'Deletion failed: ' + err);
				} else {
					var page = generic_page.GoronPage({
						title: '(Goron) Delete Competition ' + compData.name,
						header: generic_page.GoronHeader({
							title: 'Competition modification success!',
							subtitle: '',
							user_info: generic_page.GoronUserInfo(request.session.data.user)
						}),
						sidebar: generic_page.GoronSidebar(request.session.data.user),
						body: { render: function (cb) { cb('<p>Deletion was a success!</p>'); }}
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