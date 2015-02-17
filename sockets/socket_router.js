var sockets_routers = {},
	global_io;

// TODO: Setup an infrastructure to remove sockets once all connections are gone.
//  Check every couple of minutes or seconds or whatever.

function SetupSockets(io) {
	console.log('Setting up websockets...');
	global_io = io;
	
	var routers_to_create = [
		{
			// Router for server clock
			namespace: '/server-time',
			on_connect: onServerTimeConnect
		}
	];

	for (var router = 0; router < routers_to_create.length; router++) {
		console.log('Attaching router ' + routers_to_create[router].namespace);
		sockets_routers[routers_to_create[router].namespace] = io.of(routers_to_create[router].namespace);
		sockets_routers[routers_to_create[router].namespace].on('connect', routers_to_create[router].on_connect);
	}
}

function AddSocketRouter(routerDesc) {
	console.log('Adding a socket router...');
	if (!routerDesc) {
		console.log('No router desc provided - no socket created.');
	} else if (!routerDesc.on_connect) {
		console.log('No on connect functionality provided');
	} else if (!routerDesc.namespace) {
		console.log('No namespace provided for router');
	} else if (sockets_routers[routerDesc.namespace]) {
		console.log('A router for namespace ' + routerDesc.namespace + ' already exists');
	} else {
		console.log('Creating router with namespace ' + routerDesc.namespace);
		sockets_routers[routerDesc.namespace] = io.of(routerDesc.namespace);
		sockets_routers[routerDesc.namespace].on('connect', routerDesc.on_connect);
	}
}

// NEXT VERSION: I'm noticing a lot of trends in the console.log
//  messages, perhaps every message should be prefixed with the file/subsystem
//  from which it reports?
function onServerTimeConnect(socket) {
	console.log('New connection to server time namespace...');
	socket.on('request_time', function() {
		console.log('Sending system timestamp...');
		socket.emit('server_timestamp', Date.now());
	});
}

exports.SetupSockets = SetupSockets;
exports.AddSocketRouter = AddSocketRouter;