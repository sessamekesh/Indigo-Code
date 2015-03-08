'use strict';

var competition_dao = require('../dao/competition_dao'),
	new_competition_validate = require('../sockets/new_competition_validate');

exports.generateFormBody = function (desc) {
	var that = {};
	desc = desc || {};

	that.gen_dependencies = function (callback) {
		// dependencies list, err
		// dependency: type, href
		callback([{ type: 'css', href: '/datetime-picker/jquery.datetimepicker.css' },
			{ type: 'js', href: '/datetime-picker/jquery.js' },
			{ type: 'js', href: '/datetime-picker/jquery.datetimepicker.js' },
			{ type: 'js', href: 'https://cdn.socket.io/socket.io-1.2.0.js' }]);
	};

	that.render = function (callback) {
		var form_text = '<form id="new_submission_form" class="form-horizontal" method="post" action="/admin/new_comp/submit" role="form">'
			+ '\n\t<fieldset>' + '\n\t<legend>Create New Competition</legend>'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="comp_name">Name</label>'
			+ '\n\t<!-- Text input-->' // Name of the competition
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="comp_name" name="comp_name" type="text" placeholder="USU ACM Awesome Competition" class="form-control input-md" required="">'
			+ '\n\t</div><span id="comp_name_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Textarea -->' // HTML frag data
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="htmlfrag_data">HTML Body Data</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<textarea class="form-control" id="htmlfrag_data" name="htmlfrag_data">&lt;h1&gt;HTML code here &lt;/h1&gt;</textarea>'
			+ '\n\t</div><span id="htmlfrag_data_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Multiple Radios (inline) -->' // Private or public
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="is_private">Competition Type</label>'
			+ '\n\t<div class="col-md-4">\n\t<label class="radio-inline" for="is_private-0">'
			+ '\n\t<input type="radio" name="is_private" id="is_private-0" value="0" checked="checked">Public</label>'
			+ '\n\t<label class="radio-inline" for="is_private-1">'
			+ '\n\t<input type="radio" name="is_private" id="is_private-1" value="1">Private</label>'
			+ '\n\t</div><span id="is_private_err" class="help-block"></span>\n\t</div>' // Start and end date
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="start_date">Competition Start Date</label>'
			+ '\n\t<div class="col-md-4">\n\t<input id="start_date" name="start_date" type="text" class="form-control input-md">'
			+ '\n\t</div><span id="start_date_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="end_date">Competition End Date</label>'
			+ '\n\t<div class="col-md-4">\n\t<input id="end_date" name="end_date" type="text" class="form-control input-md">'
			+ '\n\t</div><span id="end_date_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Select Basic -->' // Max team size
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="max_team_size">Max Team Size</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<select id="max_team_size" name="max_team_size" class="form-control"><option value="1">1</option><option value="2">2</option>'
			+ '<option value="3" selected>3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option>'
			+ '\n\t</select>\n\t</div><span id="max_team_size_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Text input-->' // Incorrect submission time penalty
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="penalty_time">Incorrect Submission Time Penalty (minutes)</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="penalty_time" name="penalty_time" type="text" placeholder="15" class="form-control input-md" required="">'
			+ '\n\t</div>\n\t<span id="penalty_time_err" class="help-block"></span></div>\n\t'
			+ '\n\t<div class="form-group col-md-4">'
			+ '\n\t<input type="button" class="btn btn-primary" name="validate_button" onclick="send_validation_request();" value="Create New Competition"></div>' // Submit button
			+ '\n\t</fieldset>\n\t</form>';
		callback(form_text);
	};

	that.gen_scripts = function (callback) {
		var tr = '$(function() { \n\tjQuery(\'#start_date\').datetimepicker({ step: 15 }); \n\tjQuery(\'#end_date\').datetimepicker({ step: 15 });\n});',
			validate_socket_number = new_competition_validate.requestCompetitionValidationListener();

		tr += '\nvar validation_listener = io(\'/NCV' + validate_socket_number + '\');'
			+ '\nvalidation_listener.on(\'val_err\', function (err_list) {'
				+ '\n\tfor (var i = 0; i < err_list.length; i++) {'
					+ '\n\t\t$(\'#\' + err_list[i].field + \'_err\').text(err_list[i].error);'
					+ '\n\t\tconsole.log(i + \': \' + JSON.stringify(err_list[i]));'
				+ '\n\t}'
			+ '\n});'
			+ '\nvalidation_listener.on(\'validate\', function (message) {'
				+ '\n\t$(\'#new_submission_form\').submit();'
			+ '\n});'
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
			+ '\n}';

		callback(tr);
	}

	return that;
};