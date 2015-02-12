'use strict';

var user = require('./user/user'),
	statics = require('./statics/statics'),
	competition = require('./competition/competition'),
	fs = require('fs'),
	error_page = require('./page_builders/error_page');

var subsystem = {};
subsystem['/'] = statics;
subsystem['/index'] = statics;
subsystem['/user'] = user;
subsystem['/competition'] = competition;

function route(pathname, response, request) {
	// Determine which subsystem gets the request
	var subsys_path = pathname;
	if (pathname.indexOf('/', 1) > 0) {
		subsys_path = pathname.substr(0, pathname.indexOf('/', 1));
	}

	if (subsystem[subsys_path]) {
		console.log('Routing request to subsystem ' + subsys_path);
		if (pathname.indexOf('/', 1) > 0) {
			subsystem[subsys_path].route(response, request, pathname.substr(pathname.indexOf('/', 1)));
		} else {
			subsystem[subsys_path].route(response, request);
		}
	} else {
		// Check for file in public directory
		fs.exists('./public' + pathname, function(exists) {
			if (exists) {
				console.log('File found in ./public' + pathname + ', opening');
				var loadedData = '';
				var input = fs.createReadStream('./public' + pathname);
				input.on('data', function(data) {
					loadedData += data;
				});
				input.on('end', function() {
					var type = pathname.substr(pathname.lastIndexOf('.'));
					if (type === '.css') {
						type = 'text/css';
					} else if (type === '.htm' || type === '.html') {
						type = 'text/html';
					} else if (type === '.js') {
						type = 'text/javascript';
					} else {
						type = 'text/plain';
					}

					response.writeHead(200, {'Content-Type': type});
					response.write(loadedData);
					response.end();
				});
			} else {
				console.log('File not found. Reporting 404');

				var goron404 = error_page.GoronErrorPage(request.session.data.user, '404 - Page Not Found', 'The page you requested could not be loaded. It doesn\'t exist and cannot be generated. Sorry about that.');				if (goron404) {
					goron404.render(function(content, err) { 
						if (err) {
							console.log('Error in generating Goron 404: ' + err);
							console.log('Using canned 404');
							response.writeHead(404, {'Content-Type': 'text/plain'});
							response.write('404 not found!');
							response.end();
						} else {
							response.writeHead(404, {'Content-Type': 'text/html'});
							response.write(content);
							response.end();
						}
					});
				} else {
					console.log('Goron error page function returned null for some reason.');
					console.log('Using canned 404');
					response.writeHead(404, {'Content-Type': 'text/html'});
					response.write(content);
					response.end();
				}
			}
		});
	}
	// Modification: Now, routers down the line are responsible for this.
}

exports.route = route;