'use strict';

var socket_router = require('./socket_router'),
	used_namespaces = {};

// Returns: Namespace of competition validation listener.
exports.requestCompetitionValidationListener = function () {
	// NCV
	var i,
		to_create;

	for (i = 0; used_namespaces[i] !== undefined; i++);
	used_namespaces[i] = '..';

	to_create = {
		n_connections: 0,
		namespace: '/NCV' + i,
		on_connect: function (socket) {
			this.n_connections++;

			socket.on('validate', function (data) { validate_new_competition_data(socket, data); });

			socket.on('disconnect', function() {
				this.n_connections--;
				setTimeout(function () {
					if (this.n_connections === 0) {
						to_create = undefined;
					}
				}, 200);
			});
		}
	};

	socket_router.AddSocketRouter(to_create);

	return i;
}

function validate_new_competition_data (socket, data) {
	// TODO: Validate the data, return 'Success!' if the
	//  client script is to continue submitting the form.
	console.log('---new_competition_validate---');
	console.log(data);

	var error_list = [];

	// Competition name is not empty
	// Competition name is less than 50 characters
	if (data.comp_name === '' || data.comp_name === undefined) {
		error_list.push({ 'field': 'comp_name', 'error': 'Competition name cannot be empty' });
	} else if (data.comp_name.length >= 50) {
		error_list.push({ 'field': 'comp_name', 'error': 'Competition name is too long' });
	}

	// HTML frag is not empty
	// HTML frag is less than 3000 characters
	if (data.htmlfrag_data === '' || data.htmlfrag_data === undefined) {
		error_list.push({ 'field': 'htmlfrag_data', 'error': 'HTML fragment data is empty' });
	} else if (data.htmlfrag_data.length >= 3000) {
		error_list.push({ 'field': 'htmlfrag_data', 'error': 'HTML fragment data is too long' });
	}

	// is_private is either 0 or 1
	if (data.is_private != 0 && data.is_private != 1) {
		error_list.push({ 'field': 'is_private', 'error': 'Competition should be marked "private" or "public"' });
	}

	// start_date is not empty
	// start_date is a valid date
	if (data.start_date === undefined || data.start_date === '' || data.start_date === 0) {
		error_list.push({ 'field': 'start_date', 'error': 'Please select a start date' });
	} else if ((new Date(error_list.start_date)).getTime() === NaN) {
		error_list.push({ 'field': 'start_date', 'error': 'Invalid start date selected' });
	}

	// end_date is not empty
	// end_date is a valid date
	if (data.end_date === undefined || data.end_date === '' || data.end_date === 0) {
		error_list.push({ 'field': 'end_date', 'error': 'Please select an end date' });
	} else if ((new Date(error_list.end_date)).getTime() === NaN) {
		error_list.push({ 'field': 'end_date', 'error': 'Invalid end date selected' });
	}

	// max_team_size is positive, and less than 10
	if (data.max_team_size === undefined || isNaN(parseFloat(data.max_team_size)) || data.max_team_size < 1 || data.max_team_size > 10) {
		error_list.push({ 'field': 'max_team_size', 'error': 'Invalid team size - select a number 1-10' });
	}

	// incorrect submission time penalty is positive
	if (data.penalty_time === undefined || data.penalty_time === '' || data.penalty_time < 0 || isNaN(parseFloat(data.penalty_time))) {
		error_list.push({ 'field': 'penalty_time', 'error': 'Please enter a non-negative penalty time' });
	}

	if (error_list.length === 0) {
		socket.emit('validate', { 'valid': true });
	} else {
		socket.emit('val_err', error_list);
	}
}