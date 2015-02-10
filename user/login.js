'use strict';

var formidable = require('formidable'),
	user = require('./user'),
	registration_page = require('./registration_page');

var subsystem = {};

function route(response, request, remainingPath) {
	console.log('Login subsystem activated - remaining path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	if (!remainingPath || remainingPath == '') {
		// Login user - grab form, get information, yep.
		var form = new formidable.IncomingForm();
		form.parse(request, function(error, fields, files) {
			if (error) {
				console.log('Error in login system: ' + error);
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.write('Login function invoked, but it failed due to an error :(');
				response.end();
			} else {
				if (fields.register) {
					var page = registration_page.GenerateRegistrationPage(request, { user_name: fields.username});
					if (page) {
						page.render(function(content, err) {
							if (err) {
								console.log('Error in rendering registration page - ' + err);
								response.writeHead(200, {'Content-Type': 'text/plain'});
								response.write('Error rendering registration form. Check log.');
								response.end();
							} else {
								console.log('Writing registration page response...');
								response.writeHead(200, {'Content-Type': 'text/html'});
								response.write(content);
								response.end();
							}
						});
					} else {
						console.log('Error in generating registration page');
						response.writeHead(200, {'Content-Type': 'text/plain'});
						response.write('Error generating registration form. Check log.');
						response.end();
					}
				} else {
					console.log('Fields recognized:');
					console.log(fields);
					user.getUserData({ user_name: fields.username, password: fields.password },
						function(userData, err) {
							if (err) {
								console.log('Error in retrieving user data ' + err);
							}

							if (userData) {
								request.session.data.user = userData;
							} else {
								request.session.data.user = 'IncorrectLogin';
							}

							if (request.session.data.lastPage) {
								console.log('Redirecting to last page - ' + request.session.data.lastPage);
								response.writeHead(302, {'Location': request.session.data.lastPage});
								response.end();
							} else {
								console.log('No last page found. Redirecting to index page');
								response.writeHead(302, {'Location': '/'});
								response.end();
							}
						});
				}
			}
		});
	} else {
		if (subsystem[subsys_name]) {
			console.log('Forwarding request to subsystem ' + subsys_name);
			if (remainingPath.indexOf('/', 1) > 0) {
				subsystem[subsys_name].route(response, request, remainingPath.substr(remainingPath.indexOf('/', 1)));
			} else {
				subsystem[subsys_name].route(response, request);
			}
		} else {
			console.log('Action not found. Reporting 404 (login): ' + subsys_name);
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('404 not found! (Subsystem - login)');
			response.end();
		}
	}
}

exports.route = route;