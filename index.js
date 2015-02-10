// Create http object

var http = require("http"),
	url = require("url"),
	router = require("./router"),
	session = require('sesh/lib/core').magicSession();

http.createServer(function(request, response) {
	// Get the requested path...
	var pathname = url.parse(request.url).pathname;

	console.log("Request for " + pathname + " received");

	router.route(pathname, response, request);

}).listen(8080);

console.log("------------------------------USU ACM SERVER - V0.1 (Kokiri)------------------------------");
console.log("-------------------------------Developed by Kamaron Peterson------------------------------");
console.log("Server Launched");