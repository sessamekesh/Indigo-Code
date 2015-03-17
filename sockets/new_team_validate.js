'use strict';

var socket_router = require('./socket_router'),
	used_namespaces = {};

var team_dao = require('../dao/team_dao'),
	user_dao = require('../dao/user_dao');

exports.requestNewTeamValidationListener = function () {
	// NTV
	var i, to_create;
	for (i = 0; used_namespaces[i] !== undefined; i++);
	used_namespaces[i] = '..';

	to_create = {
		n_connections: 0,
		namespace: '/NTV' + i,
		on_connect: function (socket) {
			this.n_connections++;

			socket.on('validate', function (data) { validate_new_team_data (socket, data); });

			socket.on('disconnect', function () {
				this.n_connections--;
				setTimeout(function () {
					if (this.n_connections === 0) {
						delete used_namespaces[i];
						to_create = undefined;
					}
				}, 200);
			})
		}
	};

	socket_router.AddSocketRouter(to_create);

	return i;
};

function validate_new_team_data (socket, data) {
	console.log('--- new team validate ---');

	var error_list = [];

	check_teams();

	// Check team name: Not blank, and not used.
	function check_teams() {
		if (data.team_name === undefined || data.team_name === '') {
			error_list.push({ 'field': 'team_name', 'error': 'No team name provided' });
			check_users();
		} else if (data.comp_id === undefined || isNaN(data.comp_id)) {
			error_list.push({ 'field': 'generic', 'error': 'No competition ID found'});
			check_users();
		} else {
			team_dao.teamNameAvailable(data.team_name, data.comp_id, function (is_available) {
				if (!is_available) {
					error_list.push({ 'field': 'team_name', 'error': 'Team name is already in use!' });
				}

				check_users();
			});
		}
	}

	// Check users
	function check_users() {
		var ul = [], i = 0;
		for (var n in data.user_data) ul.push(n);

		check_user(ul[i]);

		function check_user(n, team_members) {
			team_members = team_members || {};

			if (i >= ul.length) {
				send_validation();
				return;
			}

			var user_valid = true;
			if (data.user_data[n].type === 'existing') {
				console.log(team_members);
				if (data.user_data[n].username === undefined || data.user_data[n].username === '') {
					error_list.push({ 'field': 'user_name_' + n, 'error': 'Must provide username' });
					user_valid = false;
				} else if (team_members[data.user_data[n].username] !== undefined) {
					error_list.push({ 'field': 'user_name_' + n, 'error': 'User already used in team registration above' });
				}

				if (data.user_data[n].password === undefined || data.user_data[n].password === '') {
					error_list.push({ 'field': 'user_pass_' + n, 'error': 'Must provide password' });
					user_valid = false;
				}

				if (user_valid === true) {
					console.log('User is indeed valid: ' + data.user_data[n].username);
					team_members[data.user_data[n].username] = 'shit';
					team_members['count'] = 'foo';
					user_dao.authUser(data.user_data[n].username, data.user_data[n].password, function (res, err) {
						if (err === 'User not found') {
							error_list.push({ 'field': 'user_name_' + n, 'error': 'User not found' });
							i++;
							check_user(ul[i], team_members);
						} else if (err) {
							console.log('----- new_team_validate: Error authenticating user: ' + err);
							error_list.push({ 'field': 'user_pass_' + n, 'error': 'Error authenticating user - see logs' });
							i++;
							check_user(ul[i], team_members);
						} else {
							if (res !== true) {
								error_list.push({ 'field': 'user_pass_' + n, 'error': 'Incorrect password' });
								i++;
								check_user(ul[i], team_members);
							} else {
								// Make sure user doesn't already have a team for this competition.
								user_dao.getUserData({ user_name: data.user_data[n].username, password: data.user_data[n].password }, function (res, err) {
									if (err) {
										console.log('new_team_validate: Error getting user data: ' + err);
										error_list.push({ 'field': 'user_name_' + n, 'error': 'Failed to get user information, notify admin.' });
										i++;
										check_user(ul[i], team_members);
									} else {
										team_dao.getTeamData({ userID: res.id, compID: data.comp_id }, function (res, err) {
											if (err) {
											} else {
												error_list.push({ 'field': 'user_name_' + n, 'error': 'User is already part of a team for this competition!' });
											}
											i++;
											check_user(ul[i], team_members);
										});
									}
								});
							}
						}
					});
				} else{
					i++;
					check_user(ul[i], team_members);
				}

			} else if (data.user_data[n].type === 'new') {
				if (data.user_data[n].username === undefined || data.user_data[n].username === '') {
					error_list.push({ 'field': 'user_name_' + n, 'error': 'Must provide username' });
					user_valid = false;
				}

				if (data.user_data[n].password === undefined || data.user_data[n].password === '') {
					error_list.push({ 'field': 'user_pass_' + n, 'error': 'Must provide password' });
					user_valid = false;
				}

				if (data.user_data[n].name === undefined || data.user_data[n].name === '') {
					error_list.push({ 'field': 'name_' + n, 'error': 'Must provide name' });
				}

				if (data.user_data[n].confirm === undefined || data.user_data[n].confirm === '') {
					error_list.push({ 'field': 'user_confirm_' + n, 'error': 'Must confirm password' });
					user_valid = false;
				} else {
					if (data.user_data[n].confirm !== data.user_data[n].password) {
						error_list.push({ 'field': 'user_confirm_' + n, 'error': 'Passwords do not match' });
						user_valid = false;
					}
				}

				if (data.user_data[n].email === undefined || data.user_data[n].email === '') {
					error_list.push({ 'field': 'email_' + n, 'error': 'Must provide an email address' });
					user_valid = false;
				} else if (!(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/.test(data.user_data[n].email))) {
					error_list.push({ 'field': 'email_' + n, 'error': 'Not a valid email address' });
					user_valid = false;
				}

				if (data.user_data[n].is_student === undefined) {
					error_list.push({ 'field': 'is_student_' + n, 'error': 'No is student data provided' });
				}

				if (user_valid) {
					user_dao.checkUserExists(data.user_data[n].username, function (res) {
						if (res === true) {
							error_list.push({ 'field': 'user_name_' + n, 'error': 'Username is taken' });
						}
						i++;
						check_user(ul[i], team_members);
					});
				} else {
					i++;
					check_user(ul[i], team_members);
				}
			} else {
				i++;
				check_user(ul[i], team_members);
			}
		}
	}

	function send_validation() {
		if (error_list.length === 0) {
			socket.emit('validate', { 'valid': true });
		} else {
			socket.emit('val_err', error_list);
		}
	}
}