'use strict';

var socket_router = require('./socket_router'),
	used_namespaces = {};

// Returns: Namespace of competition validation listener
exports.requestCompetitionValidationListener = function () {
	// NCD
	var i, to_create;

	for (i = 0; used_namespaces[i] !== undefined; i++);
	used_namespaces[i] = '..';

	to_create = {
		n_connections: 0,
		namespace: '/NCD' + i,
		on_connect: function (socket) {
			this.n_connections++;

			socket.on('validate', function (data) { validate_delete_competition(socket, data); });

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

function validate_delete_competition (socket, data) {
	// Validate that you can delete the competition...
	console.log('--delete_competition_validate');

	var error_list = ['This error is hardcoded in'];

	if (error_list.length === 0) {
		socket.emit('validate', { 'valid': true });
	} else {
		socket.emit('val_err', error_list);
	}
}