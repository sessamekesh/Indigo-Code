// Create server object

var http = require('http'),
	url = require('url'),
	router = require('./router'),
	session = require('sesh/lib/core').magicSession(),
	socket_io = require('socket.io'),
	socket_router = require('./sockets/socket_router'),
	port_number = 8888;

var server = http.createServer(function(request, response) {
	// Get path requested...
	var pathname = url.parse(request.url).pathname;
	console.log('::::::::::Request for ' + pathname + ' received::::::::::');
	
	// Send request to the router
	router.route(pathname, response, request);
});

io = socket_io(server);

socket_router.SetupSockets(io);

server.listen(port_number);

console.log('-------------------------------USU ACM SERVER - V0.2 (Goron)------------------------------');
console.log('-------------------------------Developed by Kamaron Peterson------------------------------');
console.log('Listening on port ' + port_number);