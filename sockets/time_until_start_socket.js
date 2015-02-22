'use strict';

var time_until_start_sockets = {},
	socket_router = require('./socket_router'),
	TIMER_DELAY = 500;

exports.requestTimeUntilStartSocket = function(compData) {
	if (time_until_start_sockets[compData.id] === undefined) {
		time_until_start_sockets[compData.id] = {
			n_connections: 0,
			socket: {
				namespace: '/CS' + compData.id,
				on_connect: function (socket) {
					time_until_start_sockets[compData.id].n_connections++;
					if (time_until_start_sockets[compData.id].n_connections === 1) {
						console.log('time_until_start_socket: Starting remaining time socket /CS' + compData.id);
						beginBroadcasting(time_until_start_sockets[compData.id].io, compData);
					}
					socket.on('disconnect', function () {
						time_until_start_sockets[compData.id].n_connections--;
						if (time_until_start_sockets[compData.id].n_connections == 0) {
							console.log('time_until_start_socket: /CS' + compData.id + ' ceasing broadcasting; connections closed');
						}
					});
				}
			}
		};

		time_until_start_sockets[compData.id].io = socket_router.AddSocketRouter(
			time_until_start_sockets[compData.id].socket);
	}
}

function beginBroadcasting(socket, compData) {
	if (time_until_start_sockets[compData.id].io !== undefined && time_until_start_sockets[compData.id].n_connections > 0) {
		time_until_start_sockets[compData.id].io.emit('time_until_start', (compData.end_date - Date.now()));
		setTimeout(function() {
			beginBroadcasting(socket, compData);
		}, TIMER_DELAY);
	}
}