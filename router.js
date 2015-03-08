'use strict';

var user = require('./user/user'),
	statics = require('./statics/statics'),
	competition = require('./competition/competition'),
	admin_router = require('./admin/admin_router'),
	fs = require('fs'),
	error_page = require('./page_builders/error_page');

var subsystem = {},
	redirecting_pages = {};
subsystem['/'] = statics;
subsystem['/index'] = statics;
subsystem['/user'] = user;
subsystem['/competition'] = competition;
subsystem['/admin'] = admin_router;

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

				fs.readFile('./public' + pathname, function (err, data) {
					var type = pathname.substr(pathname.lastIndexOf('.'));
					if (type === '.css') {
						type = 'text/css';
					} else if (type === '.htm' || type === '.html') {
						type = 'text/html';
					} else if (type === '.js') {
						type = 'text/javascript';
					} else if (type === '.gif') {
						type = 'image/gif';
					} else if (type === '.ico') {
						type = 'favicon/ico';
					} else if (type === '.png') {
						type = 'image/png';
					} else {
						type = 'text/plain';
					}

					response.writeHead(200, {'Content-Type': type});
					response.write(data);
					response.end();
				});
			} else {
				console.log('File not found. Reporting 404');

				error_page.ShowErrorPage(response, request,
					'404 - Page Not Found',
					'The page you requested could not be loaded. It doesn\'t exist and cannot be generated. Sorry about that.');
			}
		});
	}
	// Modification: Now, routers down the line are responsible for this.
}

exports.route = route;