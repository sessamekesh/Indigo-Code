// Create server object

var http = require('http'),
	url = require('url'),
	router = require('./router'),
	session = require('sesh/lib/core').magicSession();

http.createServer(function(request, response) {
	// Get path requested...
	var pathname = url.parse(request.url).pathname;
	console.log('Request for ' + pathname + ' received');
	
	// Send request to the router
	router.route(pathname, response, request);
}).listen(8081);

console.log("-------------------------------USU ACM SERVER - V0.2 (Goron)------------------------------");
console.log("-------------------------------Developed by Kamaron Peterson------------------------------");