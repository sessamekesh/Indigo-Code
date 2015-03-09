'use strict';

var competition_dao = require('../dao/competition_dao'),
	modify_competition_validate = require('../sockets/modify_competition_validate'),
	delete_competition_validate = require('../sockets/delete_competition_validate');

exports.generateFormBody = function (compData) {
	var that = {};
	compData = compData || {};

	if (!compData.compID) {
		compData.compID = 0;
	}

	that.gen_dependencies = function (callback) {
		// dependencies list, err
		// dependency: type, href
		callback([{ type: 'css', href: '/datetime-picker/jquery.datetimepicker.css' },
			{ type: 'js', href: '/datetime-picker/jquery.js' },
			{ type: 'js', href: '/datetime-picker/jquery.datetimepicker.js' },
			{ type: 'js', href: 'https://cdn.socket.io/socket.io-1.2.0.js' },
			{ type: 'js', href: 'http://code.jquery.com/ui/1.11.3/jquery-ui.js' }]);
	};

	that.render = function (callback) {
		var form_text = '<form id="modify_submission_form" class="form-horizontal" method="post" action="/admin/modify_comp/c' + compData.id + '/submit" role="form">'
			+ '\n\t<fieldset>' + '\n\t<legend>Create New Competition</legend>'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="comp_name">Name</label>'
			+ '\n\t<!-- Text input-->' // Name of the competition
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="comp_name" name="comp_name" type="text" placeholder="USU ACM Awesome Competition" class="form-control input-md" required="" value="' + compData.name + '">'
			+ '\n\t</div><span id="comp_name_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Textarea -->' // HTML frag data
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="htmlfrag_data">HTML Body Data</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<textarea class="form-control" id="htmlfrag_data" name="htmlfrag_data">' + compData.htmlfrag_data + '</textarea>'
			+ '\n\t</div><span id="htmlfrag_data_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Multiple Radios (inline) -->' // Private or public
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="is_private">Competition Type</label>'
			+ '\n\t<div class="col-md-4">\n\t<label class="radio-inline" for="is_private-0">'
			+ '\n\t<input type="radio" name="is_private" id="is_private-0" value="0"' + ((compData.is_private == false) ? ' checked="checked"' : '') + '>Public</label>'
			+ '\n\t<label class="radio-inline" for="is_private-1">'
			+ '\n\t<input type="radio" name="is_private" id="is_private-1" value="1"' + ((compData.is_private == true) ? ' checked="checked"' : '') + '>Private</label>'
			+ '\n\t</div><span id="is_private_err" class="help-block"></span>\n\t</div>' // Start and end date
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="start_date">Competition Start Date</label>'
			+ '\n\t<div class="col-md-4">\n\t<input id="start_date" name="start_date" type="text" class="form-control input-md" value="' + format_date(compData.start_date) + '">'
			+ '\n\t</div><span id="start_date_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="end_date">Competition End Date</label>'
			+ '\n\t<div class="col-md-4">\n\t<input id="end_date" name="end_date" type="text" class="form-control input-md" value="' + format_date(compData.end_date) + '">'
			+ '\n\t</div><span id="end_date_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Select Basic -->' // Max team size
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="max_team_size" >Max Team Size</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<select id="max_team_size" name="max_team_size" class="form-control">'
			+ '<option value="1"' + ((compData.team_size === 1) ? ' selected' : '') + '>1</option>'
			+ '<option value="2"' + ((compData.team_size === 2) ? ' selected' : '') + '>2</option>'
			+ '<option value="3"' + ((compData.team_size === 3) ? ' selected' : '') + '>3</option>'
			+ '<option value="4"' + ((compData.team_size === 4) ? ' selected' : '') + '>4</option>'
			+ '<option value="5"' + ((compData.team_size === 5) ? ' selected' : '') + '>5</option>'
			+ '<option value="6"' + ((compData.team_size === 6) ? ' selected' : '') + '>6</option>'
			+ '\n\t</select>\n\t</div><span id="max_team_size_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Text input-->' // Incorrect submission time penalty
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="penalty_time">Incorrect Submission Time Penalty (minutes)</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="penalty_time" name="penalty_time" type="text" placeholder="15" class="form-control input-md" required="" value="' + compData.incorrect_submission_time_penalty + '">'
			+ '\n\t</div>\n\t<span id="penalty_time_err" class="help-block"></span></div>\n\t'
			+ '\n\t<div class="form-group col-md-4">'
			+ '\n\t<input type="button" class="btn btn-danger" name="delete_button" onclick="send_delete_request();" value="Delete Competition"></div>' // Delete button
			+ '\n\t<div class="form-group col-md-4">'
			+ '\n\t<input type="button" class="btn btn-primary" name="modify_button" onclick="send_validation_request();" value="Push Modifications"></div>' // Modify button
			+ '\n\t</fieldset>\n\t</form>';
		callback(form_text);
	};

	that.gen_scripts = function (callback) {
		var tr = '$(function() { \n\tjQuery(\'#start_date\').datetimepicker({ step: 15 }); \n\tjQuery(\'#end_date\').datetimepicker({ step: 15 });\n});',
			validate_socket_number = modify_competition_validate.requestCompetitionValidationListener(),
			delete_socket_number = delete_competition_validate.requestCompetitionValidationListener();

		tr += '\nvar validation_listener = io(\'/NCM' + validate_socket_number + '\');'
			+ '\nvalidation_listener.on(\'val_err\', function (err_list) {'
				+ '\n\tfor (var i = 0; i < err_list.length; i++) {'
					+ '\n\t\t$(\'#\' + err_list[i].field + \'_err\').text(err_list[i].error);'
					+ '\n\t\tconsole.log(i + \': \' + JSON.stringify(err_list[i]));'
				+ '\n\t}'
			+ '\n});'
			+ '\nvalidation_listener.on(\'validate\', function (message) {'
				+ '\n\t$(\'#modify_submission_form\').attr(\'action\', \'/admin/modify_comp/c' + compData.id + '/submit\');'
				+ '\n\t$(\'#modify_submission_form\').submit();'
			+ '\n});'
			+ '\nvar delete_validate_listener = io(\'/NCD' + delete_socket_number + '\');'
			+ '\ndelete_validate_listener.on(\'val_err\', function (err_list) {'
				+ '\n\tvar error_string = \'\','
				+ '\n\t\thas_error = false;;'
				+ '\n\tfor (var i = 0; i < err_list.length; i++) {'
					+ '\n\t\tif (has_error === true) error_string += \'<br />\';'
					+ '\n\t\thas_error = true;'
					+ '\n\t\terror_string += err_list[i];'
				+ '\n\t}'
				+ '\n\tif (has_error === true) {'
					+ '\n\t\terror_string += \'<br /><br /><b>Delete anyway?</b>\';'
					+ '\n\t\t\$(\'<div />\').html("<b>Could not delete:</b><br /><p>" + error_string + "</p>").dialog({ modal: true, buttons: { Yes: function() { $(this).dialog("close"); delete_already(); }, No: function () { $(this).dialog("close"); }} });'
				+ '\n\t}'
			+ '\n});'
			+ '\ndelete_validate_listener.on(\'validate\', function (message) {'
				+ '\n\tdelete_already();'
			+ '\n});'
			+ '\nfunction delete_already() {'
				+ '\n\t$(\'#modify_submission_form\').attr(\'action\', \'/admin/modify_comp/c' + compData.id + '/delete\');'
				+ '\n\t$(\'#modify_submission_form\').submit();'
			+ '\n}'
			+ '\nfunction send_validation_request() {'
			+ '\n\tvar tosend = {};'
			+ '\n\ttosend.comp_name = $(\'#comp_name\').val();'
			+ '\n\ttosend.htmlfrag_data = $(\'#htmlfrag_data\').val();'
			+ '\n\ttosend.is_private = $(\'input:radio[name="is_private"]:checked\').val();'
			+ '\n\ttosend.start_date = $(\'#start_date\').val();'
			+ '\n\ttosend.end_date = $(\'#end_date\').val();'
			+ '\n\ttosend.max_team_size = $(\'#max_team_size\').val();'
			+ '\n\ttosend.penalty_time = $(\'#penalty_time\').val();'
			+ '\n\tvalidation_listener.emit(\'validate\', tosend);'
			+ '\n\t$(\'#comp_name_err\').text(\'\');'
			+ '\n\t$(\'#htmlfrag_data_err\').text(\'\');'
			+ '\n\t$(\'#is_private_err\').text(\'\');'
			+ '\n\t$(\'#start_date_err\').text(\'\');'
			+ '\n\t$(\'#end_date_err\').text(\'\');'
			+ '\n\t$(\'#max_team_size_err\').text(\'\');'
			+ '\n\t$(\'#penalty_time_err\').text(\'\');'
			+ '\n}'
			+ '\n\nfunction send_delete_request() {'
			+ '\n\tvar tosend = {};'
			+ '\n\ttosend.comp_name = $(\'#comp_name\').val();'
			+ '\n\ttosend.htmlfrag_data = $(\'#htmlfrag_data\').val();'
			+ '\n\ttosend.is_private = $(\'input:radio[name="is_private"]:checked\').val();'
			+ '\n\ttosend.start_date = $(\'#start_date\').val();'
			+ '\n\ttosend.end_date = $(\'#end_date\').val();'
			+ '\n\ttosend.max_team_size = $(\'#max_team_size\').val();'
			+ '\n\ttosend.penalty_time = $(\'#penalty_time\').val();'
			+ '\n\delete_validate_listener.emit(\'validate\', tosend);'
			+ '\n\t$(\'#comp_name_err\').text(\'\');'
			+ '\n\t$(\'#htmlfrag_data_err\').text(\'\');'
			+ '\n\t$(\'#is_private_err\').text(\'\');'
			+ '\n\t$(\'#start_date_err\').text(\'\');'
			+ '\n\t$(\'#end_date_err\').text(\'\');'
			+ '\n\t$(\'#max_team_size_err\').text(\'\');'
			+ '\n\t$(\'#penalty_time_err\').text(\'\');'
			+ '\n}';

		callback(tr);
	}

	return that;
};

function format_date(date) {
	var month = ('00' + date.getMonth()).substr(-2),
		day = ('00' + date.getDate()).substr(-2),
		year = date.getFullYear(),
		hour = ('00' + date.getHours()).substr(-2),
		min = ('00' + date.getMinutes()).substr(-2);

	return (year + '/' + month + '/' + day + ' ' + hour + ':' + min);
}