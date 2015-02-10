'use strict';

var subsystem = {};

function route(response, request, remainingPath) {
	console.log('Logout subsystem activated - remaining path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0){
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	if (!remainingPath || remainingPath ==''){
		// Logout user - nice and easy.
		request.session.data.user = 'Guest';

		if (request.session.data.lastPage) {
			console.log('Redirecting to last page ' + request.session.data.lastPage);
			response.writeHead(302, {'Location': request.session.data.lastPage});
			response.end();
		} else {
			console.log('Redirecting to index page');
			response.writeHead(302, {'Location': '/'});
			response.end();
		}
	}
}

exports.route = route;