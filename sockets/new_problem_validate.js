'use strict';

var socket_router = require('./socket_router'),
	used_namespaces = {};

exports.requestNewProblemValidationListener = function () {
	// NPV
	var i, to_create;

	for (i = 0; used_namespaces[i] !== undefined; i++);
	used_namespaces[i] = '..';

	to_create = {
		n_connections: 0,
		namespace: '/NPV' + i,
		on_connect: function (socket) {
			this.n_connections++;

			socket.on('validate', function (data) { validate_new_problem_data (socket, data); });

			socket.on('disconnect', function () {
				this.n_connections--;
				setTimeout(function () {
					if (this.n_connections === 0) {
						delete used_namespaces[i];
						to_create = undefined;
					}
				}, 200);
			});
		}
	};

	socket_router.AddSocketRouter(to_create);

	return i;
};

function validate_new_problem_data (socket, data) {
	console.log('---new_problem_validate---');

	var error_list = [];

	if (data.prob_name === undefined || data.prob_name === '') {
		error_list.push({ 'field': 'prob_name', 'error': 'Problem name cannot be empty' });
	} else if (data.prob_name.length > 255) {
		error_list.push({ 'field': 'prob_name', 'error': 'Problem name is too long' });
	}

	if (data.time_limit === undefined || data.time_limit === '') {
		error_list.push({ 'field': 'time_limit', 'error': 'Must enter a time limit (in ms)' });
	} else if (isNaN(parseInt(data.time_limit)) || data.time_limit < 0) {
		error_list.push({ 'field': 'time_limit', 'error': 'Must enter a non-negative integer for time limit' });
	}

	if (data.file_name === undefined || data.file_name === '') {
		error_list.push({ 'field': 'desc_file', 'error': 'Must upload a description file' });
	} else if (data.file_name.substr(-4) !== '.pdf' && data.file_name.substr(-4) !== '.htm'
			&& data.file_name.substr(-5) !== '.html' && data.file_name.substr(-4) !== '.png'
			&& data.file_name.substr(-4) !== '.txt') {
		error_list.push({ 'field': 'desc_file', 'error': 'Must upload a file of type PNG, PDF, HTML, or TXT' });
	}

	if (data.soln_name === undefined || data.soln_name === '') {
		error_list.push({ 'field': 'soln_file', 'error': 'Must upload a working solution source file' });
	}

	if (data.soln_lang === undefined || data.soln_lang === '') {
		error_list.push({ 'field': 'soln_lang', 'error': 'Somehow, you managed to not pick a solution language. Good work.' });
	} else if (isNaN(parseInt(data.soln_lang))) {
		error_list.push({ 'field': 'soln_lang', 'error': 'Invalid solution language ID sent back from form: ' + data.soln_lang });
	}

	if (data.test_cases === undefined || data.test_cases === '' || data.test_cases.length === 0) {
		error_list.push({ 'field': 'general', 'error': 'Must provide at least one test case' });
	} else {
		for (var i = 0; i < data.test_cases.length; i++) {
			if (data.test_cases[i].in_name === undefined || data.test_cases[i].in_name === '') {
				error_list.push({ 'field': 'tc' + data.test_cases[i].id, 'error': 'No input file provided' });
			}

			if (data.test_cases[i].out_name === undefined || data.test_cases[i].out_name === '') {
				error_list.push({ 'field': 'tc' + data.test_cases[i].id, 'error': 'No output file provided' });
			}
		}
	}

	if (error_list.length === 0) {
		socket.emit('validate', { 'valid': true });
	} else {
		socket.emit('val_err', error_list);
	}
}