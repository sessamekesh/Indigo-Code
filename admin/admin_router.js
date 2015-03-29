'use strict';

var subsystem = {};

var error_page = require('../page_builders/error_page');

subsystem['/new_comp'] = require('./new_competition');
subsystem['/modify_comp'] = require('./modify_competition');

exports.route = function (response, request, remainingPath) {
	console.log('admin_router: Admin subsystem activated. Authenticating user...');

	if (request.session.data.user === undefined
		|| request.session.data.user === 'Guest'
		|| request.session.data.user === 'IncorrectLogin'
		|| request.session.data.user.is_admin == false) {
		error_page.ShowErrorPage(response, request, 'User not authorized', 'Maybe there\'s something in the \'admin\' directory, and maybe there isn\'t. Either way, there\'s nothing here for <b>you</b> to see.');
	} else {
		// If there is no remaining path, show 404
		if (remainingPath === undefined || remainingPath === '') {
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Page found... Undefined remaining path');
			response.end();
		} else {
			// If there is a remaining path, find it
			var subsys_path = remainingPath;
			if (remainingPath.indexOf('/', 1) > 0) {
				subsys_path = remainingPath.substr(0, remainingPath.indexOf('/', 1));
				remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
				console.log('Subsystem: ' + subsys_path + ', Remaining: ' + remainingPath);
			} else {
				remainingPath = undefined;
			}

			if (subsystem[subsys_path] === undefined) {
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.write('Subsystem: ' + subsys_path + ' Remaining: ' + remainingPath);
				response.end();
			} else {
				subsystem[subsys_path].route(response, request, remainingPath);
			}
		}
	 }
}