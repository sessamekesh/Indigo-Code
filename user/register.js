'use strict';

var registration_page = require('./registration_page'),
	formidable = require('formidable'),
	user_dao = require('../dao/user_dao');

var subsystem = {};

function route(response, request, remainingPath) {
	console.log('Register subsystem activated - remaining path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	if (!remainingPath || remainingPath == '') {
		// Register, vanilla
		registerUser(response, request);
	} else {
		// Check for subsystem
		if (subsystem[subsys_name]) {
			console.log('Forwarding request to subsystem ' + subsys_name);
			if (remainingPath.indexOf('/', 1) > 0) {
				subsystem[subsys_name].route(response, request, remainingPath.substr(remainingPath.indexOf('/', 1)));
			} else {
				subsystem[subsys_name].route(response, request);
			}
		} else {
			console.log('Action not found. Reporting 404 (register): ' + subsys_name);
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('404 not found! (Subsystem - register)');
			response.end();
		}
	}
}

function registerUser(response, request) {
	// Are we grabbing by form, or by previous attempt?
	//  If by previous attempt, registration_attempt will be in the session data.
	if (request.session.data.registration_attempt) {
		console.log('Showing registration form from previous attempt...');
		var page = registration_page.GenerateRegistrationPage(request, {
			user_name: request.session.data.registration_attempt.user_name,
			name: request.session.data.registration_attempt.name,
			tagline: request.session.data.registration_attempt.tagline,
			error: request.session.data.registration_attempt.error
		});
		if (page) {
			page.render(function(content, err) {
				if (err) {
					console.log('Error rendering registration page: ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Unknown error rendering re-registration page. Know this at least - registration failed.');
					response.end();
				} else {
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(content);
					response.end();
				}
			});
		} else {
			console.log('Unknown error re-generating registration page');
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Unknown error re-generating registration page. Know this at least - registration failed.');
			response.end();
		}
		delete request.session.data.registration_attempt;
	} else {
		console.log('Processing registration data from form...');

		var form = new formidable.IncomingForm();
		form.parse(request, function(error, fields, files) {
			console.log(fields);
			if (error) {
				console.log('Error in registration system: ' + error);
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.write('Register function invoked, but it failed due to an error :(');
				response.end();
			} else {
				if (fields.password !== fields.confirm_password) {
					console.log('Redirecting to registration form - password not correctly confirmed');
					// Whoops! Something's off indeed!
					request.session.data.registration_attempt = {
						error: 'Password does not match confirm_password field',
						user_name: fields.username,
						name: fields.name,
						tagline: fields.tagline
					};

					// Recursively call function, this time with registration_attempt var set.
					registerUser(response, request);
				} else {console.log('Passing registration data on to user_dao...');
					// All validation tests passed? On to the DAO!
					user_dao.addUser({
						user_name: fields.username,
						password: fields.password,
						name: fields.name,
						tagline: fields.tagline,
						email: fields.email
					}, function(userData, err) {
						if (err) {
							console.log('Error in inserting user data - ' + err);
							response.writeHead(200, {'Content-Type': 'text/plain'});
							response.write('Registration failed on database insert - check log');
							response.end();
						} else {
							request.session.data.user = userData;
							console.log('User data of new user:');
							console.log(userData);
							console.log('Redirecting to index page as new user');
							response.writeHead(302, {'Location': '/'});
							response.end();
						}
					});
				}
			}
		});
	}
}

exports.route = route;