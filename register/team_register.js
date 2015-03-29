'use strict';

var subsystem = {
	'/submit': require('./team_register_submit')
};

var error_page = require('../page_builders/error_page'),
	generic_page = require('../page_builders/generic_page'),
	new_team_validate = require('../sockets/new_team_validate');

exports.route = function (response, request, compData, remainingPath) {
	console.log('team_register: Subsystem activated');

	if (remainingPath === undefined || remainingPath === '') {
		// Show the form here...
		var page = generic_page.GoronPage({
			title: '(Goron) Register a Team',
			header: generic_page.GoronHeader({
				title: 'Register team for competition "' + compData.name + '"',
				subtitle: 'USU ACM Competition Framework 0.2 (Goron)',
				user_info: generic_page.GoronUserInfo(request.session.data.user)
			}),
			sidebar: generic_page.GoronSidebar(request.session.data.user),
			body: generateNewTeamForm(compData)
		});

		if (page === undefined) {
			console.log('team_register: Could not render page');
			error_page.ShowErrorPage(response, request, 'Error generating page', 'Unknown error, page object could not be generated');
		} else {
			page.render(function (w, err) {
				if (err) {
					console.log('team_register: Could not render page');
					error_page.ShowErrorPage(response, request, 'Internal Error', 'Failed to generate page');
				} else {
					console.log('team_register: Have data, rendering it');
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(w);
					response.end();
				}
			});
		}
	} else {
		var subsys_path = remainingPath;
		if (remainingPath.indexOf('/', 1) > 0) {
			subsys_path = remainingPath.substr(0, remainingPath.indexOf('/', 1));
			remainingPath = remainingPath.substr(remainingPath.indexOf('/', 1));
		} else {
			remainingPath = undefined;
		}

		if (subsystem[subsys_path] === undefined) {
			// Subsystem is undefined, 404
			error_page.ShowErrorPage(response, request, '404 - Page Not Found', 'Subsystem ' + subsys_path + ' in team registration system not found');
		} else {
			// Subsystem is defined, route to it.
			subsystem[subsys_path].route(response, request, compData, remainingPath);
		}
	}
};

function generateNewTeamForm (compData) {
	var that = {};

	that.gen_dependencies = function (callback) {
		// Dependencies as type, href pair
		callback([{ type: 'js', href: 'https://cdn.socket.io/socket.io-1.2.0.js' },
			{ type: 'js', href: 'http://code.jquery.com/ui/1.11.3/jquery-ui.js' }]);
	};

	that.render = function (callback) {
		var form_text = '<h1>Register Team for "' + compData.name + '"</h1>'
			+ '\n<form id="new_team_form" class="form-horizontal" method="post" action="/register/c' + compData.id + '/submit">'
			+ '\n\t<fieldset>\n\t<legend>Basic Information</legend>'
			+ '\n\t<!-- Team Name -->'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="team_name">Team Name</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="team_name" name="team_name" type="text" placeholder="team_awesome" class="form-control input-md" required="">'
			+ '\n\t</div><span id="team_name_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Team Tagline -->'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="team_tagline">Team Tagline</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="team_tagline" name="team_tagline" type="text" placeholder="Appears on the scoreboard" class="form-control input-md" required="">'
			+ '\n\t</div><span id="team_tagline_err" class="help-block"></span>\n\t</div>'
			+ '\n\t</fieldset>';

		generate_user_form_bits();

		function generate_user_form_bits() {
			form_text += '\n\t<fieldset><legend>Team Members</legend>'
				+ '\n\t<!-- User 1 -->'
				+ '\n\t<div class="form-group">'
				+ '\n\t<label class="col-md-4 control-label" for="user_type_1">User 1</label>'
				+ '\n\t<div class="col-md-4">'
				+ '\n\t<label class="radio-inline" for="usertype_existing_1">'
				+ '\n\t\t<input type="radio" name="usertype_1" id="usertype_existing_1" value="existing" checked="checked">Use Existing'
				+ '\n\t</label>'
				+ '\n\t<label class="radio-inline" for="usertype_new_1">'
				+ '\n\t\t<input type="radio" name="usertype_1" id="usertype_new_1" value="new">Create New User'
				+ '\n\t</label>'
				+ '\n\t</div>'
				+ '\n\t</div>'
				+ '\n\t<div id="user_data_1">'
				+ '\n\t<div class="form-group">'
				+ '\n\t<label class="col-md-4 control-label" for="user_name_1">Username</label>'
				+ '\n\t<div class="col-md-4">'
				+ '\n\t<input type="text" placeholder="Username" required="" id="user_name_1" name="user_name_1">'
				+ '\n\t</div><span id="user_name_1_err" class="help-block"></span>'
				+ '\n\t</div>'
				+ '\n\t<div class="form-group">'
				+ '\n\t<label class="col-md-4 control-label" for="user_pass_1">Password</label>'
				+ '\n\t<div class="col-md-4">'
				+ '\n\t<input type="password" required="" id="user_pass_1" name="user_pass_1">'
				+ '\n\t</div><span id="user_pass_1_err" class="help-block"></span>'
				+ '\n\t</div>'
				+ '\n\t</div>';

			for (var i = 2; i <= compData.team_size; i++) {
				form_text += '<hr />'
					+ '\n\t<!-- User ' + i + ' -->'
					+ '\n\t<div class="form-group">'
					+ '\n\t<label class="col-md-4 control-label" for="usertype_' + i + '">User ' + i + '</label>'
					+ '\n\t<div class="col-md-4">'
					+ '\n\t<label class="radio-inline" for="usertype_blank_' + i + '">'
					+ '\n\t\t<input type="radio" name="usertype_' + i + '" id="usertype_blank_' + i + '" value="blank" checked="checked">Leave Blank'
					+ '\n\t</label>'
					+ '\n\t<label class="radio-inline" for="usertype_existing_' + i + '">'
					+ '\n\t\t<input type="radio" name="usertype_' + i + '" id="usertype_existing_'+ i + '" value="existing">Use Existing'
					+ '\n\t</label>'
					+ '\n\t<label class="radio-inline" for="usertype_new_' + i + '">'
					+ '\n\t\t<input type="radio" name="usertype_' + i + '" id="usertype_new_' + i + '" value="new">Create New User'
					+ '\n\t</label>'
					+ '\n\t</div>'
					+ '\n\t</div>'
					+ '\n\t<div id="user_data_' + i + '">'
					+ '\n\t</div>';
			}

			form_text += '\n\t</fieldset>'
				+ '\n\t<div class="form-group">'
				+ '\n\t<label class="col-md-4 control-label" for="validate"></label>'
				+ '\n\t<div class="col-md-4">'
				+ '\n\t<input type="button" id="validate" class="btn btn-primary col-md-offset-8" onclick="validate_form();" value="Submit!">'
				+ '\n\t</div>'
				+ '\n\t</div>'
				+ '\n</form>';

			callback(form_text);
		}
	};

	that.gen_scripts = function (callback) {
		var tr = '',
			validate_socket_number = new_team_validate.requestNewTeamValidationListener();

		tr += 'var validation_listener = io(\'/NTV' + validate_socket_number + '\');'
			+ '\nvalidation_listener.on(\'val_err\', function (err_list) {'
			+ '\n\t$("#validate").attr("disabled", false);'
			+ '\n\tfor (var i = 0; i < err_list.length; i++) {'
			+ '\n\t\tif (err_list[i].field === \'general\') {'
			+ '\n\t\t\talert(err_list[i].error);'
			+ '\n\t\t} else {'
			+ '\n\t\t\t$(\'#\' + err_list[i].field + \'_err\').text(err_list[i].error);'
			+ '\n\t\t}'
			+ '\n\t}'
			+ '\n});\n'
			+ '\nvalidation_listener.on(\'validate\', function (message) {'
				+ '\n\t$("#validate").attr("disabled", false);'
			+ '\n\t$(\'#new_team_form\').submit();'
			+ '\n});\n'
			+ '\nfunction validate_form() {'
			+ '\n\t$("#validate").attr("disabled", true);'
			+ '\n\tvar tosend = {};'
			+ '\n\ttosend.team_name = $(\'#team_name\').val();'
			+ '\n\ttosend.team_tagline = $(\'#team_tagline\').val();'
			+ '\n\ttosend.n_users = ' + compData.team_size + ';'
			+ '\n\ttosend.comp_id = ' + compData.id + ';'
			+ '\n\ttosend.user_data = {};'
			+ '\n\t$(\'#team_name_err\').text(\'\');'
			+ '\n\t$(\'#team_tagline_err\').text(\'\');'
			+ '\n\tfor (var i = 1; i <= ' + compData.team_size + '; i++) {'
			+ '\n\t\ttosend.user_data[i] = { };'
			+ '\n\t\tif ($("#usertype_blank_" + i + ":checked").val() !== undefined) {'
			+ '\n\t\t\ttosend.user_data[i].type = "blank";'
			+ '\n\t\t} else if ($("#usertype_existing_" + i + ":checked").val() !== undefined) {'
			+ '\n\t\t\ttosend.user_data[i].type = "existing";'
			+ '\n\t\t\ttosend.user_data[i].username = $("#user_name_" + i).val();'
			+ '\n\t\t\ttosend.user_data[i].password = $("#user_pass_" + i).val();'
			+ '\n\t\t\t$("#user_name_" + i + "_err").text("");'
			+ '\n\t\t\t$("#user_pass_" + i + "_err").text("");'
			+ '\n\t\t} else if ($("#usertype_new_" + i + ":checked").val() !== undefined) {'
			+ '\n\t\t\ttosend.user_data[i].type = "new";'
			+ '\n\t\t\ttosend.user_data[i].username = $("#user_name_" + i).val();'
			+ '\n\t\t\ttosend.user_data[i].password = $("#user_pass_" + i).val();'
			+ '\n\t\t\ttosend.user_data[i].confirm = $("#user_confirm_" + i).val();'
			+ '\n\t\t\ttosend.user_data[i].name = $("#name_" + i).val();'
			+ '\n\t\t\ttosend.user_data[i].email = $("#email_" + i).val();'
			+ '\n\t\t\tif ($("#is_student_" + i + ":checked").val() !== undefined) {'
			+ '\n\t\t\t\ttosend.user_data[i].is_student = true;'
			+ '\n\t\t\t} else {'
			+ '\n\t\t\t\ttosend.user_data[i].is_student = false;'
			+ '\n\t\t\t}'
			+ '\n\t\t\t$("#user_name_" + i + "_err").text("");'
			+ '\n\t\t\t$("#user_pass_" + i + "_err").text("");'
			+ '\n\t\t\t$("#user_confirm_" + i + "_err").text("");'
			+ '\n\t\t\t$("#name_" + i + "_err").text("");'
			+ '\n\t\t\t$("#email_" + i + "_err").text("");'
			+ '\n\t\t\t$("#is_student_" + i + "_err").text("");'
			+ '\n\t\t}'
			+ '\n\t}'
			+ '\n\tvalidation_listener.emit(\'validate\', tosend);'
			+ '\n}\n'
			+ '\n$(function () {';
		for (var i = 1; i <= compData.team_size; i++) {
			tr += '\n\t$("#usertype_blank_' + i + '").change(function () {'
				+ '\n\t\tconsole.log("Usertype blank ' + i + ' activated!");'
				+ '\n\t\t$("#user_data_' + i + '").html("");'
				+ '\n\t});'
				+ '\n\t$("#usertype_existing_' + i + '").change(function () {'
				+ '\n\t\t$("#user_data_' + i + '").html('
					+ '\n\t\t\t\'<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="user_name_' + i + '">Username</label>'
					+ '<div class="col-md-4">'
					+ '<input type="text" placeholder="Username" required="" id="user_name_' + i + '" name="user_name_' + i + '">'
					+ '</div><span id="user_name_' + i + '_err" class="help-block"></span>'
					+ '</div><div class="form-group">'
					+ '<label class="col-md-4 control-label" for="user_pass_' + i + '">Password</label>'
					+ '<div class="col-md-4">'
					+ '<input type="password" required="" id="user_pass_' + i + '" name="user_pass_' + i + '">'
					+ '</div><span id="user_pass_' + i + '_err" class="help-block"></span></div>'
					+ '\''
				+ '\n\t\t);'
				+ '\n\t});'
				+ '\n\t$("#usertype_new_' + i + '").change(function () {'
				+ '\n\t\t$("#user_data_' + i + '").html('
					+ '\n\t\t\t\'<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="user_name_' + i + '">Username</label>'
					+ '<div class="col-md-4">'
					+ '<input type="text" placeholder="Username" required="" id="user_name_' + i + '" name="user_name_' + i + '">'
					+ '</div><span id="user_name_' + i + '_err" class="help-block"></span></div>'

					+ '<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="user_pass_' + i + '">Password</label>'
					+ '<div class="col-md-4">'
					+ '<input type="password" required="" id="user_pass_' + i + '" name="user_pass_' + i + '">'
					+ '</div><span id="user_pass_' + i + '_err" class="help-block"></span></div>'

					+ '<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="user_confirm_' + i + '">Confirm Password</label>'
					+ '<div class="col-md-4">'
					+ '<input type="password" required="" id="user_confirm_' + i + '" name="user_confirm_' + i + '">'
					+ '</div><span id="user_confirm_' + i + '_err" class="help-block"></span></div>'

					+ '<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="name_' + i + '">Name</label>'
					+ '<div class="col-md-4">'
					+ '<input type="text" placeholder="' + (Math.random() < 0.5 ? 'Alice Coder' : 'Bob Coder') + '" required="" id="name_' + i + '" name="name_' + i + '">'
					+ '</div><span id="name_' + i + '_err" class="help-block"></span></div>'

					+ '<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="email_' + i + '">Email Address</label>'
					+ '<div class="col-md-4">'
					+ '<input type="text" id="email_' + i + '" name="email_' + i + '" required="">'
					+ '</div><span id="email_' + i + '_err" class="help-block"></span></div>'

					+ '<div class="form-group">'
					+ '<label class="col-md-4 control-label" for="is_student_' + i + '">Student User</label>'
					+ '<div class="col-md-4">'
					+ '<input type="checkbox" name="is_student_' + i + '" id="is_student_' + i + '" checked>'
					+ '</div><span id="is_student_' + i + '_err" class="help-block"></span></div>'
					+ '\''
				+ '\n\t\t);'
				+ '\n\t});';
		}
		tr += '});'

		callback(tr);
	};

	return that;
}