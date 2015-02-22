var sockets_routers = {},
	global_io;

// TODO: Setup an infrastructure to remove sockets once all connections are gone.
//  Check every couple of minutes or seconds or whatever.

function SetupSockets(io) {
	console.log('Setting up websockets...');
	global_io = io;
}

function AddSocketRouter(routerDesc) {
	console.log('Adding a socket router...');
	if (!routerDesc) {
		console.log('socket_router: No router desc provided - no socket created.');
	} else if (!routerDesc.on_connect) {
		console.log('socket_router: No on connect functionality provided');
	} else if (!routerDesc.namespace) {
		console.log('socket_router: No namespace provided for router');
	} else if (sockets_routers[routerDesc.namespace]) {
		console.log('socket_router: A router for namespace ' + routerDesc.namespace + ' already exists');
		return sockets_routers[routerDesc.namespace];
	} else {
		console.log('socket_router: Creating router with namespace ' + routerDesc.namespace);
		sockets_routers[routerDesc.namespace] = io.of(routerDesc.namespace);
		sockets_routers[routerDesc.namespace].on('connect', routerDesc.on_connect);
		return sockets_routers[routerDesc.namespace];
	}
}

// NEXT VERSION: I'm noticing a lot of trends in the console.log
//  messages, perhaps every message should be prefixed with the file/subsystem
//  from which it reports?
function onServerTimeConnect(socket) {
	console.log('socket_router: New connection to server time namespace...');
	socket.on('request_time', function() {
		console.log('socket_router: Sending system timestamp...');
		socket.emit('server_timestamp', Date.now());
	});
}

exports.SetupSockets = SetupSockets;
exports.AddSocketRouter = AddSocketRouter;