'use strict';

var time_remaining_sockets = {},
	socket_router = require('./socket_router'),
	TIMER_DELAY = 1111;

exports.requestTimeRemainingSocket = function(compData) {
	console.log('time_remaining_sockets: Checking ' + compData.id + '...');
	if (time_remaining_sockets[compData.id] === undefined) {
		time_remaining_sockets[compData.id] = {
			n_connections: 0,
			socket: {
				namespace: '/CT' + compData.id,
				on_connect: function (socket) {
					time_remaining_sockets[compData.id].n_connections++;
					if (time_remaining_sockets[compData.id].n_connections === 1) {
						console.log('time_remaining_sockets: Starting remaining time socket /CT' + compData.id);
						beginBroadcasting(time_remaining_sockets[compData.id].io, compData);
					}
					socket.on('disconnect', function () {
						time_remaining_sockets[compData.id].n_connections--;
						if (time_remaining_sockets[compData.id].n_connections == 0) {
							console.log('time_remaining_sockets: /CT' + compData.id + ' ceasing broadcasting; connections closed');
						}
					});
				}
			}
		};

		time_remaining_sockets[compData.id].io = socket_router.AddSocketRouter(time_remaining_sockets[compData.id].socket);
	}
}

function beginBroadcasting(socket, compData) {
	if (time_remaining_sockets[compData.id].io !== undefined && time_remaining_sockets[compData.id].n_connections > 0) {
		time_remaining_sockets[compData.id].io.emit('time_remaining', (compData.end_date - Date.now()));
		setTimeout(function() {
			beginBroadcasting(socket, compData);
		}, TIMER_DELAY);
	}
}