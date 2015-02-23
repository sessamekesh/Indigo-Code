'use strict';

var generic_page = require('../page_builders/generic_page'),
	submission_dao = require('../dao/submission_dao'),
	competition_page = require('../page_builders/competition_page'),
	error_page = require('../page_builders/error_page'),
	result_listener_socket = require('../sockets/result_listener_socket');

exports.route = function(response, request, compData, problemData, remainingPath) {
	// TODO KIP: What if there is just a '/' ? Change that everywhere!
	if (remainingPath === undefined || remainingPath === '' || remainingPath === '/') {
		showSubmissionPage(response, request, compData, problemData, 0);
	} else if(/\/\d+/.test(remainingPath)) {
		showSubmissionPage(response, request, compData, problemData, (/\/\d+/.exec(remainingPath)).toString().substr(1));
	} else {
		console.log('submission_page: Routing request to view submissions');
		response.writeHead('200', {'Content-Type': 'text/plain'});
		response.write('You\'ve reached the submission page!');
		response.write('Remaining path: ' + remainingPath);
		response.end();
	}
}

function showSubmissionPage(response, request, compData, problemData, page_num) {
	console.log('Showing submission page for problem ' + problemData.name);

	var submission_page = generic_page.GoronPage({
		title: '(Goron) Results for problem ' + problemData.name,
		body: submissionPageBody(problemData, +page_num),
		header: generic_page.GoronHeader({
				title: 'Results for problem ' + problemData.name,
				subtitle: 'USU ACM Competition ' + compData.name,
				user_info: competition_page.GoronCompetitionUserInfo(request.session.data.user, compData)
			}),
		sidebar: competition_page.GoronCompetitionSidebar(request.session.data.user, compData)
	});

	if (!submission_page) {
		error_page.ShowErrorPage(response, request, 'Could not generate page', 'An unknown error occurred, and the submission page you were trying to view could not be generated.');
	} else {
		submission_page.render(function (content, err) {
			if (err !== undefined) {
				error_page.ShowErrorPage(response, request, 'Could not render page', 'The requested page could not be rendered - ' + err);
			} else {
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(content);
				response.end();
			}
		});
	}
}

function submissionPageBody(problemData, page_num) {

	var start = page_num * 25,
		finish = (page_num + 1) * 25;

	function gen_dependencies(callback) {
		result_listener_socket.requestResultListener(problemData);
		callback(['https://cdn.socket.io/socket.io-1.2.0.js']);
	}

	// NEXT VERSION: Use static scripts, yo. This is miserable.
	function gen_scripts(callback) {
		// TODO FRONTEND: This is also where you would put a flash on submission received and
		//  all that front-end jazz.
		var listener_script =
			  'var res_listener = io(\'/PR' + problemData.id + '\'),'
			  + '\n\ttrs = io(\'/CT2\');'
			+ '\nres_listener.on(\'submission_finished\', function (res) {'
				+ '\n\tconsole.log(\'Received submission \' + res.id + \' with result: \' + res.result + \' and notes: \' + res.notes);'
				+ '\n\tvar etm_r = document.getElementById(\'td_res_\' + res.id);'
				+ '\n\tetm_r.innerHTML = res.result;'
			+ '\n});'
			+ '\ntrs.on(\'time_remaining\', function(tr) {'
				+ '\n\tconsole.log(\'Time remaining event fired, with param: \' + tr);'
				+ '\n\tvar ctr_f = document.getElementById(\'ctr\');'
				+ '\n\tif (tr > 0) {'
				+ '\n\t\ttr = Math.floor(tr / 1000);'
				+ '\n\t\tvar secs = tr % 60,'
				+ '\n\t\t\tmins = Math.floor(tr / 60) % 60,'
				+ '\n\t\t\thrs = Math.floor(tr / 360) % 24,'
				+ '\n\t\t\tsecs_txt = (\'00\' + secs).slice(-2),'
				+ '\n\t\t\tmins_txt = (\'00\' + mins).slice(-2),'
				+ '\n\t\t\thrs_txt = (\'00\' + hrs).slice(-2);'
				+ '\n\t\tctr_f.innerHTML = \'Time remaining: \' + hrs_txt + \':\' + mins_txt + \':\' + secs_txt;'
				+ '\n\t} else {'
				+ '\n\t\tctr_f.innerHTML = \'<b>Time is up!</b>\';'
				+ '\n\t}'
			+ '\n});'
		callback(listener_script);
	}

	function render(callback) {
		var body_text = '<table class="table table-striped">'
			+ '\n\t<tr class="table_header">'
			+ '\n\t\t<th>ID</th><th>Team</th><th>Language</th><th>Date&frasl;Time</th><th>Result</th>';
			+ '\n\t</tr>';

		// Get submissions...
		submission_dao.getProblemSubmissions(problemData.id, start, finish, function (res, err) {
			if (err) {
				console.log('submission_page: Error retrieving submissions: ' + err);
				body_text += '</table><p>Could not retrieve submissions table - check logs for error</p>';
				finish_rendering();
			} else {
				render_table(res);
			}
		});

		function render_table(results) {
			for (var i = 0; i < results.length; i++) {

				body_text += '\n\t<tr id="tr_sub_' + results[i].submission_id + '"';

				if (results[i].result == 'AC') {
					body_text += ' class="success" ';
				}

				body_text += '>'
					+ '\n\t\t<td>' + results[i].submission_id + '</td>'
					+ '\n\t\t<td>' + results[i].user_name + '<br /><i>' + results[i].user_tagline + '</i></td>'
					+ '\n\t\t<td>' + results[i].lang_name + '</td>'
					+ '\n\t\t<td>' + formatDate(new Date(results[i].submission_time)) + '</td>'
					+ '\n\t\t<td id="td_res_' + results[i].submission_id + '">' + results[i].result + '</td>'
					+ '\n\t</tr>';
			}
			body_text += '\n</table>';
			finish_rendering();
		}

		function finish_rendering() {
			if (page_num > 1) {
				body_text += '\n<a href="/competition/c' + problemData.comp_id + '/p' + problemData.id + '/submissions/' + (+page_num - 1)
					+ '">Previous Page</a><br />';
			} else if (page_num == 1) {
				body_text += '\n<a href="/competition/c' + problemData.comp_id + '/p' + problemData.id + '/submissions'
					+ '">Previous Page</a><br />';
			}
			body_text += '\n<a href="/competition/c' + problemData.comp_id + '/p' + problemData.id + '/submissions/' + (+page_num + 1)
				+ '">Next Page</a>';
			callback(body_text);
		}
	}

	return {
		render: render,
		gen_dependencies: gen_dependencies,
		gen_scripts: gen_scripts
	};
}

function formatDate(date) {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
	return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' '
		+ ('00' + ((date.getHours() % 12) + 1)).substr(-2) + ':'
		+ ('00' + date.getMinutes()).substr(-2) + ':'
		+ ('00' + date.getSeconds()).substr(-2)
		+ (date.getHours() >= 12 ? ' PM' : ' AM');
}