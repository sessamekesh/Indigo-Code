'use strict';

var time_until_start_sockets = {},
	socket_router = require('./socket_router'),
	TIMER_DELAY = 500;

exports.requestTimeUntilStartSocket = function(compData) {
	if (time_until_start_sockets[compData.id] === undefined) {
		time_until_start_sockets[compData.id] = {
			n_connections: 0,
			is_broadcasting: false,
			socket: {
				namespace: '/CS' + compData.id,
				on_connect: function (socket) {
					time_until_start_sockets[compData.id].n_connections++;
					if (time_until_start_sockets[compData.id].n_connections === 1) {
						if (time_until_start_sockets[compData.id].is_broadcasting === false) {
							time_until_start_sockets[compData.id].is_broadcasting = true;
							beginBroadcasting(time_until_start_sockets[compData.id].io, compData);
						}
					}
					socket.on('disconnect', function () {
						time_until_start_sockets[compData.id].n_connections--;
						if (time_until_start_sockets[compData.id].n_connections == 0) {
							time_until_start_sockets[compData.id].is_broadcasting = false;
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
	if (time_until_start_sockets[compData.id].io !== undefined && time_until_start_sockets[compData.id].n_connections > 0 && time_until_start_sockets[compData.id].is_broadcasting === true) {
		time_until_start_sockets[compData.id].io.emit('time_until_start', (compData.start_date.getTime() - (Date.now())));
		setTimeout(function() {
			beginBroadcasting(socket, compData);
		}, TIMER_DELAY);

		if (time_until_start_sockets[compData.id].n_connections <= 0) {
			time_until_start_sockets[compData.id].is_broadcasting = false;
		}
	}
}