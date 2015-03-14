'use strict';

var error_page = require('../page_builders/error_page'),
	querystring = require('querystring'),
	team_dao = require('../dao/team_dao'),
	user_dao = require('../dao/user_dao'),
	generic_page = require('../page_builders/generic_page');

exports.route = function (response, request, compData, remainingPath) {
	// Do things, hopefully productively
	console.log('--- New team registration received ---');

	var submission_data = '';

	if (request.method != 'POST') {
		console.log('team_register_submit: Data not received');
		error_page.ShowErrorPage(response, request, 'Invalid Form Submission', 'No data received from a form submission');
	} else {
		request.on('data', function (data) {
			submission_data += data;
			if (submission_data.length > 1e5) {
				request.connection.destroy();
			}
		});

		request.on('end', function () {
			var form_data = querystring.parse(submission_data);

			console.log(form_data);

			create_team();

			var team_id;

			// Create Team
			function create_team() {
				team_dao.registerTeam({
					name: form_data.team_name,
					tagline: form_data.team_tagline,
					competition_id: compData.id
				}, function (resID, err) {
					if (err) {
						error_page.ShowErrorPage(response, request, 'Team Creation Error', 'Team Creation Error: ' + err);
					} else {
						team_id = resID;
						process_user(1, []);
					}
				});
			}

			// For each user...
			function process_user(i, user_ids) {
				if (form_data['usertype_' + i] === undefined) {
					add_user_teams(user_ids, 0);
				} else {
					if (form_data['usertype_' + i] === 'existing') {
						existing_user(i, user_ids);
					} else if (form_data['usertype_' + i] === 'new') {
						new_user(i, user_ids);
					} else {
						process_user(i + 1);
					}
				}
			}

			// If new user, create new user.
			function new_user(i, user_ids) {
				user_dao.addUser({
					user_name: form_data['user_name_' + i],
					name: form_data['name_' + i],
					password: form_data['user_pass_' + i],
					email: form_data['email_' + i],
					is_student: (form_data['is_student_' + i] !== undefined)
				}, function (user_data, err) {
					if (err === 'User not found') {
						console.log('team_register_submit: Error adding new user: ' + err);
						error_page.ShowErrorPage(response, request, 'User Creation Error', 'Failed to create user ' + form_data['user_name_' + i] + ', they were not added to the team.');
					} else {
						user_ids.push(user_data.id);
						process_user(i + 1, user_ids);
					}
				});
			}

			// If blank, skip.
			// If existing, authenticate.
			function existing_user(i, user_ids) {
				user_dao.authUser(form_data['user_name_' + i], form_data['user_pass_' + i], function (res, err) {
					if (err) {
						console.log('team_register_submit: Error adding existing user: ' + err);
						error_page.ShowErrorPage(response, request, 'Failed to add user ' + form_data['user_name_' + i] + '. Check logs. Team was still created.');
					} else {
						user_dao.getUserData({ user_name: form_data['user_name_' + i], password: form_data['user_pass_' + i]}, function (res, err) {
							if (err) {
								console.log('team_register_submit: Failed to get user ID for user ' + form_data['user_name_' + i] + ': ' + err);
								error_page.ShowErrorPage(response, request, 'Failed to get user information for ' + form_data['user_name_' + i] + ', was not added to team. Team was still created.');
							} else {
								user_ids.push(res.id);
								process_user(i + 1, user_ids);
							}
						});
					}
				});
			}

			// If undefined, end.
			function add_user_teams(user_ids, i) {
				if (user_ids.length <= i) {
					show_page();
				} else {
					team_dao.registerUserToTeam(user_ids[i], team_id, function (res, err) {
						if (err) {
							console.log('Error registering user to team: ' + err);
						}

						add_user_teams(user_ids, i + 1);
					});
				}
			}

			// Show confirmation or error page.
			function show_page() {
				error_page.ShowErrorPage(response, request, 'Success!', 'Success in the registration and stuff!');
			}
		});
	}
};