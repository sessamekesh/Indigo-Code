'use strict';

var subsystem = {};

var error_page = require('../page_builders/error_page');

exports.route = function (response, request, remainingPath) {
	console.log('admin_router: Admin subsystem activated. Authenticating user...');

	if (request.session.data.user === undefined
		|| request.session.data.user === 'Guest'
		|| request.session.data.user === 'IncorrectLogin'
		|| request.session.data.user.is_admin == false) {
		error_page.ShowErrorPage(response, request, 'User not authorized', 'Maybe there\'s something in the \'admin\' directory, and maybe there isn\'t. Either way, there\'s nothing here for <b>you</b> to see.');
	} else {
		// Is authorized, do things.
	}
}