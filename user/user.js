'use strict';

var user_dao = require('../dao/user_dao'),
	login = require('./login'),
	register = require('./register'),
	logout = require('./logout');

var subsystem = {};
subsystem['/login'] = login;
subsystem['/register'] = register;
subsystem['/logout'] = logout;
subsystem['/modify'] = null;

function route(response, request, remainingPath) {
	console.log('Subsystem user activated - remaining path: ' + remainingPath);
	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	// Begin routing...
	if (remainingPath && remainingPath !== '') {
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
			response.write('404 not found! (Subsystem - user)');
			response.end();
		}
	} else {
		console.log('Action not found. Reporting 404 (user)');
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('404 not found! (Subsystem - user)');
		response.end();
	}
}

// callback: user, err
// get user from user description from SQL database
function getUserData(userDesc, callback) {
	if (!userDesc || !userDesc.user_name || !userDesc.password) {
		callback(null, 'Missing username or password');
	} else {
		user_dao.getUserData(userDesc, function(userData, err) {
			if (err) {
				callback(null, 'Error retrieving user data - ' + err);
			} else {
				callback(userData);
			}
		});
	}
}

exports.route = route;
exports.getUserData = getUserData;