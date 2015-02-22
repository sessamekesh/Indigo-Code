'use strict';

var server_time_socket,
	n_connections = 0,
	socket_router = require('./socket_router'),
	TIMER_DELAY = 8000;

exports.requestServerTimeSocket = function() {
	server_time_socket = socket_router.AddSocketRouter({
		namespace: '/server-time',
		onConnect: onConnect
	});
};

var onConnect = function (socket) {
	if (n_connections === 0) {
		console.log('server_time_socket: Starting server time socket...');
		beginBroadcasting();
	}
	n_connections++;
	socket.on('disconnect', function() {
		n_connections--;
		if (n_connections == 0) {
			console.log('server_time_socket: Broadcasting paused, no connected sockets.');
		}
	});
};

// TODO KIP: or NEXT VERSION: Instead of 2 seconds, make it dynamic -
//  so depending on the server load, you can adjust socket frequency;
function beginBroadcasting() {
	if (n_connections > 0 && server_time_socket !== undefined) {
		server_time_socket.emit('server_timestamp', Date.now());
		setTimeout(function () {
			beginBroadcasting();
		}, TIMER_DELAY);
	}
}