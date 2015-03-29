'use strict';

var generic_page = require('../page_builders/generic_page');

function GenerateRegistrationPage(request, fields, error_list) {
	console.log('---registration_page: Generating registration page with fields:');
	console.log(fields);
	console.log(error_list);

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

	if (error_list === undefined) {
		console.log('ERR LIST UNDEFINED');
		error_list = {};
	}

	function renderBody(callback) {
		console.log('Rendering the body for a registration page...');
		// Create the form itself
		var toCallback = '<div id="content" class="col-md-10">'
			+ '\n<form class="form-horizontal" action="/user/register" method="post" role="form">'
			+ '\n\t<div class="form-group">'
			+ '\n\t\t<h2 style="text-align: center">Register for ACM Competitions</h2>';

		// Generic errors
		if (error_list['generic'] !== undefined) {
			toCallback += '\n\t<h4 style="color: red;">Error - ' + error_list['generic']['message'] + '</h4>';
		}

		// Username
		if (error_list['username'] !== undefined) {
			toCallback += '\n\t\t<div class="control-group has-' + error_list['username']['type'] + '">';
			toCallback += '\n\t\t\t<label class="control-label" for="username">Username:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="username"' + (fields.user_name !== undefined ? ' value="' + fields.user_name + '"' : '') + '>';
			toCallback += '\n\t\t\t<span class="help-block">' + error_list['username']['message'] + '</span>'
			toCallback += '\n\t\t</div>';
		} else {
			toCallback += '\n\t\t<div class="control-group">';
			toCallback += '\n\t\t\t<label class="control-label" for="username">Username:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="username"' + (fields.user_name !== undefined ? ' value="' + fields.user_name + '"' : '') + '>';
			toCallback += '\n\t\t</div>';
		}

		// Name
		if (error_list['name'] !== undefined) {
			toCallback += '\n\t\t<div class="control-group has-' + error_list['name']['type'] + '">';
			toCallback += '\n\t\t\t<label class="control-label" for="name">Name:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="name"' + (fields.name !== undefined ? ' value="' + fields.name + '"' : '') + '>';
			toCallback += '\n\t\t\t<span class="help-block">' + error_list['name']['message'] + '</span>'
			toCallback += '\n\t\t</div>';
		} else {
			toCallback += '\n\t\t<div class="control-group">';
			toCallback += '\n\t\t\t<label class="control-label" for="name">Name:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="name"' + (fields.name !== undefined ? ' value="' + fields.name + '"' : '') + '>';
			toCallback += '\n\t\t</div>';
		}

		// Password and Confirm Password
		if (error_list['password'] !== undefined) {
			toCallback += '\n\t\t<div class="control-group has-' + error_list['password']['type'] + '">';
			toCallback += '\n\t\t\t<label class="control-label" for="password">Password:</label>';
			toCallback += '\n\t\t\t<input type="password" class="form-control" name="password">';
			toCallback += '\n\t\t\t<span class="help-block">' + error_list['password']['message'] + '</span>'
			toCallback += '\n\t\t\t<label class="control-label" for="confirm_password">Confirm Password:</label>';
			toCallback += '\n\t\t\t<input type="password" class="form-control" name="confirm_password">';
			toCallback += '\n\t\t\t<span class="help-block"></span>'
			toCallback += '\n\t\t</div>';
		} else {
			console.log(error_list);
			console.log(error_list['password']);
			toCallback += '\n\t\t<div class="control-group">';
			toCallback += '\n\t\t\t<label class="control-label" for="password">Password:</label>';
			toCallback += '\n\t\t\t<input type="password" class="form-control" name="password">';
			toCallback += '\n\t\t\t<label class="control-label" for="confirm_password">Confirm Password:</label>';
			toCallback += '\n\t\t\t<input type="password" class="form-control" name="confirm_password">';
			toCallback += '\n\t\t</div>';
		}

		// Tagline
		if (error_list['tagline'] !== undefined) {
			toCallback += '\n\t\t<div class="control-group has-' + error_list['tagline']['type'] + '">';
			toCallback += '\n\t\t\t<label class="control-label" for="tagline">Tagline:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="tagline"' + (fields.tagline !== undefined ? ' value="' + fields.tagline + '"' : '') + '>';
			toCallback += '\n\t\t\t<span class="help-block">' + error_list['tagline']['message'] + '</span>'
			toCallback += '\n\t\t</div>';
		} else {
			toCallback += '\n\t\t<div class="control-group">';
			toCallback += '\n\t\t\t<label class="control-label" for="tagline">Tagline:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="tagline"' + (fields.tagline !== undefined ? ' value="' + fields.tagline + '"' : '') + '>';
			toCallback += '\n\t\t</div>';
		}

		// Email address
		if (error_list['email'] !== undefined) {
			toCallback += '\n\t\t<div class="control-group has-' + error_list['email']['type'] + '">';
			toCallback += '\n\t\t\t<label class="control-label" for="email">Email Address:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="email"' + (fields.email !== undefined ? ' value="' + fields.email + '"' : '') + '>';
			toCallback += '\n\t\t\t<span class="help-block">' + error_list['email']['message'] + '</span>'
			toCallback += '\n\t\t</div>';
		} else {
			toCallback += '\n\t\t<div class="control-group">';
			toCallback += '\n\t\t\t<label class="control-label" for="email">Email Address:</label>';
			toCallback += '\n\t\t\t<input type="text" class="form-control" name="email"' + (fields.email !== undefined ? ' value="' + fields.email + '"' : '') + '>';
			toCallback += '\n\t\t</div>';
		}

		toCallback +='\n\t\t<input type="submit" class="btn btn-primary" name="submit" value="Register!"><br />'
			+ '\n\t</div>'
			+ '\n</form><br />'
			+ '\n<i>* Your tagline will appear by your name to all users who view your public information<br />'
			+ '\nIt also will appear on any scoreboard highlights in which you are</i>'
			+ '\n</div>';

		callback(toCallback);
	}

	return page;
}

exports.GenerateRegistrationPage = GenerateRegistrationPage;