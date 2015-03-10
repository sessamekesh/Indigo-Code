'use strict';

var subsystem = {
	'/submit': require('./new_problem_submit')
};

var error_page = require('../page_builders/error_page'),
	generic_page = require('../page_builders/generic_page'),
	new_problem_validate = require('../sockets/new_problem_validate'),
	language_dao = require('../dao/language_dao');

exports.route = function (response, request, remainingPath, compData) {
	console.log('new_problem: Subsystem activated');

	if (remainingPath === undefined || remainingPath === '') {
		// Show the form here...
		showNewProblemPage(response, request, compData);
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
			error_page.ShowErrorPage(response, request, '404 - Page Not Found', 'Subsystem ' + subsys_path + ' not found!');
		} else {
			// Subsystem is defined, route to it.
			subsystem[subsys_path].route(response, request, remainingPath, compData);
		}
	}
};

function showNewProblemPage(response, request, compData) {
	var page = generic_page.GoronPage({
		title: '(Goron) Create a new problem',
		header: generic_page.GoronHeader({
			title: 'Create new problem for competition ' + compData.name,
			subtitle: 'Version 0.2 (Goron)',
			user_info: generic_page.GoronUserInfo(request.session.data.user)
		}),
		sidebar: generic_page.GoronSidebar(request.session.data.user),
		body: generateNewProblemForm(compData)
	});

	if (page === undefined) {
		console.log('new_problem: could not create page object');
		error_page.ShowErrorPage(response, request, 'Internal Error', 'Failed to generate page on subsystem new_problem');
	} else {
		page.render(function (w, err) {
			if (err) {
				console.log('new_problem: could not render page');
				error_page.ShowErrorPage(response, request, 'Error Generating Page', err);
			} else {
				console.log('new_problem: have data, showing it');
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(w);
				response.end();
			}
		});
	}
}

function generateNewProblemForm(compData) {
	var that = {};

	that.gen_dependencies = function (callback) {
		callback([{ type: 'css', href: '/datetime-picker/jquery.datetimepicker.css' },
			{ type: 'js', href: '/datetime-picker/jquery.js' },
			{ type: 'js', href: '/datetime-picker/jquery.datetimepicker.js' },
			{ type: 'js', href: 'https://cdn.socket.io/socket.io-1.2.0.js' },
			{ type: 'js', href: 'http://code.jquery.com/ui/1.11.3/jquery-ui.js' }]);
	};

	that.render = function (callback) {
		var form_text = '<form id="new_problem_form" class="form-horizontal" method="post" action="/admin/modify_comp/c' + compData.id + '/add_problem/submit" role="form" enctype="multipart/form-data">'
			+ '\n\t<fieldset>\n\t<legend>Basic Problem Data</legend>'
			+ '\n\t<!-- Name Input -->'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="prob_name">Name</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="prob_name" name="prob_name" type="text" placeholder="Awesome ACM Problem" class="form-control input-md" required="">'
			+ '\n\t</div><span id="prob_name_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Description File -->'
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="desc_file">Description File</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="desc_file" name="desc_file" type="file" />'
			+ '\n\t</div><span id="desc_file_err" class="help-block"></span>\n\t</div>'
			+ '\n\t<!-- Default Time Limit -->'
			+ '\n\t<div class="form-group">\n\t<label class="col-md-4 control-label" for="time_limit">Default Time Limit (ms)</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="time_limit" name="time_limit" type="text" placeholder="2000" class="form-control input-md" required="mm">'
			+ '\n\t</div>\n\t<span id="time_limit_err" class="help-block"></span></div>'
			+ '\n\t</fieldset>'
			+ '\n\t<fieldset><legend>Solution Data</legend>'
			+ '\n\t<!-- Solution File -->'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="soln_file">Solution File</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<input id="soln_file" name="soln_file" type="file" />'
			+ '\n\t</div><span id="soln_file_err" class="help-block"></span>'
			+ '\n\t</div>';

		// Grab list of languages from language_dao...
		language_dao.getLanguageList(function (res, err) {

			form_text += '\n\t<!-- Solution Language -->'
			+ '\n\t<div class="form-group">'
			+ '\n\t<label class="col-md-4 control-label" for="soln_lang">Language</label>'
			+ '\n\t<div class="col-md-4">'
			+ '\n\t<select id="soln_lang" name="soln_lang" class="form-control">';

			if (err) {
				console.log('new_problem: Could not fetch available languages: ' + err);
				callback(null, 'Error getting languages available: ' + err);
			} else {
				for (var i = 0; i < res.length; i++) {
					form_text += '\n\t\t<option value="' + res[i].id + '">' + res[i].name + '</option>';
				}
				form_text += '\n\t</select>\n\t</div>'
					+ '\n\t<span id="soln_lang_err" class="help-block"></span></div>'
					+ '\n\t</fieldset>'
				add_test_case_section();
			}
		});

		function add_test_case_section() {
			form_text += '\n\t<fieldset id="test_case_section">'
				+ '\n\t<legend>Test Cases</legend>'
				+ '\n\t<div id="test_cases">'
				+ '\n\t</div>'
				+ '\n\t<div class="form-group">'
				+ '\n\t<div class="col-md-4">'
				+ '\n\t<input type="button" class="btn btn-default" name="btn_add_test_case" onclick="add_test_case();" value="Add...">'
				+ '\n\t</div></div>'
				+ '\n\t</fieldset>';

			finish_form();
		}

		function finish_form() {
			form_text += '\n\t<div class="form-group col-md-4">'
				+ '\n\t<input type="button" class="btn btn-primary" onclick="send_validation_request();" value="Create Problem"></div>'
				+ '\n</form>';
			callback(form_text);
		}
	};

	that.gen_scripts = function (callback) {
		var tr = '',
			validate_socket_number = new_problem_validate.requestNewProblemValidationListener();
		tr += 'var validation_listener = io(\'/NPV' + validate_socket_number + '\'),'
			+ '\n\tnext_test_case_id = 1,'
			+ '\n\ttest_case_datas = [];'
			+ '\nvalidation_listener.on(\'val_err\', function (err_list) {'
				+ '\n\tfor (var i = 0; i < err_list.length; i++) {'
				+ '\n\t\tif(err_list[i].field === \'general\') {'
				+ '\n\t\t\talert(err_list[i].error);'
				+ '\n\t\t} else {'
				+ '\n\t\t\t$(\'#\' + err_list[i].field + \'_err\').text(err_list[i].error);'
				+ '\n\t\t}'
				+ '\n\t\tconsole.log(i + \': \' + JSON.stringify(err_list[i]));'
				+ '\n\t}'
			+ '\n});'
			+ '\nvalidation_listener.on(\'validate\', function (message) {'
			+ '\n\t$(\'#new_problem_form\').submit();'
			+ '\n});'
			+ '\nfunction send_validation_request() {'
				+ '\n\tvar tosend = {};'
				+ '\n\ttosend.prob_name = $(\'#prob_name\').val();'
				+ '\n\ttosend.time_limit = $(\'#time_limit\').val();'
				+ '\n\ttosend.file_name = $(\'#desc_file\').val();'
				+ '\n\ttosend.soln_name = $(\'#soln_file\').val();'
				+ '\n\ttosend.soln_lang = $(\'#soln_lang\').val();'
				+ '\n\ttosend.test_cases = test_case_datas;'
				+ '\n\t$(\'#prob_name_err\').text(\'\');'
				+ '\n\t$(\'#desc_file_err\').text(\'\');'
				+ '\n\t$(\'#time_limit_err\').text(\'\');'
				+ '\n\t$(\'#soln_file_err\').text(\'\');'
				+ '\n\t$(\'#soln_lang_err\').text(\'\');'
				+ '\n\tvalidation_listener.emit(\'validate\', tosend);'
			+ '\n}'
			+ '\nfunction add_test_case() {'
			+ '\n\tvar tcid = next_test_case_id;'
			+ '\n\tvar new_tc_html = \'<div id="tc\' + tcid + \'" class="form-group">\''
			+ '\n\t\t+ \'<label class="col-md-4 control-label" for="rmtc\' + tcid + \'">Test Case \' + tcid + \':</label>\''
			+ '\n\t\t+ \'<div class="col-md-4">\''
			+ '\n\t\t+ \'<input type="button" class="btn btn-danger" id="rmtc\' + tcid + \'" name="rmtc\' + tcid + \'" onclick="remove_test_case(\' + tcid + \');" value="Delete">\''
			+ '\n\t\t+ \'<div id="tcd\' + tcid + \'" style="display:none">\''
			+ '\n\t\t+ \'<input type="file" name="tcin\' + tcid + \'" id="tcin\' + tcid + \'">\''
			+ '\n\t\t+ \'<input type="file" name="tcout\' + tcid + \'" id="tcout\' + tcid + \'">\''
			+ '\n\t\t+ \'</div>\''
			+ '\n\t\t+ \'</div><span id="tc\' + tcid + \'_err" class="help-block"></span></div>\';'
			+ '\n\t$(\'#test_cases\').append(new_tc_html);'
			+ '\n\t$(\'#tcd\' + tcid).dialog({'
				+ '\n\t\tmodal: true,'
				+ '\n\t\tbuttons: {'
				+ '\n\t\t\t"Add Test Case": function () {'
				+ '\n\t\t\t\ttest_case_datas.push({ id: tcid, in_name: $(\'#tcin\' + tcid).val(), out_name: $(\'#tcout\' + tcid).val() });'
				+ '\n\t\t\t\t$(this).dialog("close");'
				+ '\n\t\t\t},'
				+ '\n\t\t\t"Cancel": function () {'
				+ '\n\t\t\t\tremove_test_case(tcid);'
				+ '\n\t\t\t\t$(this).dialog("close");'
				+ '\n\t\t\t}'
				+ '\n\t\t}'
			+ '\n\t});'
			+ '\n\tnext_test_case_id += 1;'
			+ '\n}'
			+ '\nfunction remove_test_case(tcid) {'
			+ '\n\tfor (var i = 0; i < test_case_datas.length; i++) {'
			+ '\n\t\tif (test_case_datas[i].id === tcid) {'
			+ '\n\t\t\ttest_case_datas.splice(i, 1); break;'
			+ '\n\t\t}'
			+ '\n\t}'
			+ '\n\t$(\'#tc\' + tcid).remove();'
			+ '\n}';
		callback(tr);
	};

	return that;
}