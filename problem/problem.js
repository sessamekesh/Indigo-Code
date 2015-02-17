'use strict';

function route(response, request, compData, problemID, remainingPath) {
	console.log('problem: Routing request for problem ' + compData.id + ':' + problemID);
	console.log('Remaining path: ' + remainingPath);

	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write('We have something for problem ' + problemID);
	response.write('Yes we do.');
	response.end();
}

exports.route = route;