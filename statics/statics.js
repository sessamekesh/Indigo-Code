'use strict';

var generic_page = require('../page_builders/generic_page.js'),
	about = require('./about.js');

var subsystem = {};

subsystem['/about'] = about;

function route(response, request, remainingPath) {
	console.log('Static subsystem activated. Additional path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0){
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

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
		console.log('No additional path. Generating index page.');
		var page = generic_page.GoronPage({
			title: '(Goron) USU ACM Competition Framework',
			header: generic_page.GoronHeader({
				title: 'USU ACM Coding Competition Framework',
				subtitle: 'Version 0.2 (Goron)',
				user_info: generic_page.GoronUserInfo(request.session.data.user)
			}),
			sidebar: generic_page.GoronSidebar(request.session.data.user),
			body: generic_page.GoronBody('Replace with "Body From Fragment" or something')
		});
		if (page) {
			page.render(function (content, err) {
				if (err) {
					console.log('Error rendering static page - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Error rendering static page. See log for details.');
					response.end();
				} else {
					console.log('Rendering of static page finished. Sending to user...');
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(content);
					response.end();
				}
			});
		} else {
			console.log('Error generating static page - no page object returned');
			// TODO: Error page here.
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Could not generate static page. See log for details.');
			response.end();
		}
	}

	request.session.data.lastPage = '/index' + (remainingPath ? remainingPath : '');
}

exports.route = route;