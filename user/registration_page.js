'use strict';

var generic_page = require('../page_builders/generic_page');

function GenerateRegistrationPage(request, fields) {
	console.log('Generating registration page with fields:');
	console.log(fields);

	// Return a GoronPage object
	var page = generic_page.GoronPage({
		title: '(Goron) Register new user',
		header: generic_page.GoronHeader({
			title: 'Register for ACM Goings-Ons',
			subtitle: 'Version 0.2 (Goron)',
			user_info: generic_page.GoronUserInfo(request.session.data.user)
		}),
		sidebar: generic_page.GoronSidebar(request.session.data.user),
		body: {
			render: function(callback) { renderBody(callback); }
		}
	});

	function renderBody(callback) {
		console.log('Rendering the body for a registration page...');
		// Create the form itself
		callback(
			'<form action="/user/register" method="post">'
			+ '\n\t<h2 style="text-align: center">Register for ACM Competitions</h2>'
			+ ((fields.error) ? ('\n\t<b>Error: ' + fields.error + '</b><br />') : '')
			+ '\n\t<label for="username">Username:</label>'
			+ '\n\t<input type="text" name="username" value="' + ((fields.user_name) ? fields.user_name : '') + '"><br />'
			+ '\n\t<label for="name">Name:</label>'
			+ '\n\t<input type="text" name="name" value="' + ((fields.name) ? fields.name : '') + '"><br />'
			+ '\n\t<label for="password">Password:</label>'
			+ '\n\t<input type="password" name="password" value=""><br />'
			+ '\n\t<label for="confirm_password">Confirm Password:</label>'
			+ '\n\t<input type="password" name="confirm_password" value=""><br />'
			+ '\n\t<label for="tagline">Tagline*</label>'
			+ '\n\t<input type="text" name="tagline" value="' + ((fields.tagline) ? fields.tagline : '') + '"><br />'
			+ '\n\t<label for="email">Email Address</label>'
			+ '\n\t<input type="text" name="email" value=""><br />'
			+ '\n\t<input type="submit" name="submit" value="Register!"><br />'
			+ '\n</form><br />'
			+ '\n<i>* Your tagline will appear by your name to all users who view your public information<br />'
			+ '\nIt also will appear on any scoreboard highlights in which you are</i>'
		);
	}

	return page;
}

exports.GenerateRegistrationPage = GenerateRegistrationPage;