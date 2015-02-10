'use strict';

var generic_page = require('../page_builders/generic_page.js');

var subsystem = {};

function route(response, request, remainingPath) {
	console.log('About subsystem activated. Additional path: ' + remainingPath);

	// Begin routing...
	if (remainingPath && remainingPath !== '') {
		if (subsystem[subsys_name]) {
			console.log('Forwarding request to subsystem ' + subsys_name);
			if (remainingPath.indexOf('/', 1) > 0) {
				subsystem[subsys_name].route(response, request, remainingPath.substr(remainingPath.indexOf('/', 1)));
			} else {
				subsystem[subsys_name].route(response, request);
			}
		} else {
			console.log('Subsystem ' + subsys_name + ' not found!');
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('404 not found! (Subsystem - statics)');
			response.end();
		}
	} else {
		// Generate about page...
		console.log('No additional path found. Generating about page.');
		var page = generic_page.GoronPage({
			title: '(Goron) About ACM Competition Framework',
			header: generic_page.GoronHeader({
				title: 'About USU ACM Coding Competition Framework',
				subtitle: 'Version 0.2 (Goron)',
				user_info: generic_page.GoronUserInfo(request.session.data.user)
			}),
			sidebar: generic_page.GoronSidebar(request.session.data.user),
			body: AboutBody()
		});

		if (page) {
			page.render(function (content, err) {
				if (err) {
					console.log('Error rendering about page - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Error rendering about page. See log for details.');
					response.end();
				} else {
					console.log('Rendering of about page finished. Sending to user...');
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(content);
					response.end();
				}
			});
		} else {
			console.log('Error generating about page - no page object returned');
			// TODO: Error page here.
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Could not generate about page. See log for details.');
			response.end();
		}
	}
}

function AboutBody() {
	return {
		render: function(callback) {
			callback('TODO: Generate about page body here');
		}
	}
}

exports.route = route;