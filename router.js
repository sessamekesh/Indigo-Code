var requestHandlers = require("./requestHandlers"),
	fs = require("fs");

var handle = {};

// Add website handles here...
handle['/'] = requestHandlers.index;
handle['/index'] = requestHandlers.index;
handle['/login'] = requestHandlers.login;
handle['/logout'] = requestHandlers.logout;
handle['/register-new-user'] = requestHandlers.registerNew;
handle['/register'] = requestHandlers.register;
handle['/c'] = requestHandlers.makeCompetitionPage;
handle['/co'] = requestHandlers.getCompetitionObject;
handle['/submit'] = requestHandlers.judge_submission;
handle['/scores'] = requestHandlers.getScoreboard;
handle['/submissions'] = requestHandlers.getSubmissions;

function route(pathname, response, request) {
	console.log(pathname);
	if(typeof handle[pathname] === 'function') {
		handle[pathname](response, request);
	} else {
		console.log("No request handler found for " + pathname);
		console.log("Searching for associated file...");

		var pathnameToUse = pathname;
		if (pathnameToUse[0] === '/') {
			pathnameToUse = './public' + pathnameToUse;
		}

		fs.exists(pathnameToUse, function(exists) {
			if (exists) {
				console.log("File found!");
				var loadedData = '';
				var input = fs.createReadStream(pathnameToUse);
				input.on('data', function(data) {
					loadedData += data;
				});
				input.on('end', function() {
					var type = pathnameToUse.substr(pathnameToUse.lastIndexOf('.'));
					if (type === '.css') {
						type = 'text/css';
					} else if (type === '.htm' || type === '.html') {
						type = 'text/html';
					} else {
						type = 'text/plain';
					}
					response.writeHead(200, {"Content-Type": type});
					response.write(loadedData);
					response.end();
				});
			} else {
				// Look for a fragment with the given name
				console.log('Pathname: ' + pathname);
				var rawName;
				if (pathname[0] === '/') {
					rawName = pathname.substr(1);
				} else {
					rawName = pathname;
				}
				if (pathname.indexOf('.') > -1) {
					rawName = rawName.substr(0, pathname.lastIndexOf('.'));
				}
				console.log('Looking for fragment at ' + './frags/' + rawName + '.frag');
				fs.exists('./frags/' + rawName + '.frag', function(exists) {
					if (exists) {
						console.log('Fragment found!');
						requestHandlers.pageFromFragment(response, request, rawName);
					} else {
						console.log("File not found. Reporting 404");
						response.writeHead(404, {"Content-Type": "text/plain"});
						response.write("404 not found!");
						response.end();
					}
				});
			}
		});
	}
}

exports.route = route;