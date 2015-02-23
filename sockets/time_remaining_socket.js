'use strict';

var time_remaining_sockets = {},
	socket_router = require('./socket_router'),
	TIMER_DELAY = 1111;

exports.requestTimeRemainingSocket = function(compData) {
	if (time_remaining_sockets[compData.id] === undefined) {
		console.log('time_remaining_sockets: Does not exist. Creating...');
		time_remaining_sockets[compData.id] = {
			n_connections: 0,
			is_broadcasting: false,
			socket: {
				namespace: '/CT' + compData.id,
				on_connect: function (socket) {
					time_remaining_sockets[compData.id].n_connections++;
					if (time_remaining_sockets[compData.id].n_connections === 1) {
						if (!time_remaining_sockets[compData.id].is_broadcasting) {
							time_remaining_sockets[compData.id].is_broadcasting = true;
							beginBroadcasting(time_remaining_sockets[compData.id].io, compData);
						}
					}
					socket.on('disconnect', function () {
						time_remaining_sockets[compData.id].n_connections--;
					});
				}
			}
		};

		time_remaining_sockets[compData.id].io = socket_router.AddSocketRouter(time_remaining_sockets[compData.id].socket);
	} else {
		console.log('time_remaining_sockets: Exists. Not creating.')
	}
}

function beginBroadcasting(socket, compData) {
	if (time_remaining_sockets[compData.id].io !== undefined && time_remaining_sockets[compData.id].is_broadcasting === true) {
		time_remaining_sockets[compData.id].io.emit('time_remaining', (compData.end_date - Date.now()));
		setTimeout(function() {
			beginBroadcasting(socket, compData);
		}, TIMER_DELAY);

		if (time_remaining_sockets[compData.id].n_connections <= 0) {
			time_remaining_sockets[compData.id].is_broadcasting = false;
		}
	}
}