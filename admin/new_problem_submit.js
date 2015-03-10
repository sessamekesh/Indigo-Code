'use strict';

// TODO KIP: Write this
exports.route = function (response, request, remainingPath, compData) {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write('Submission received! But discarded, since the system does not yet handle that.');
	response.end();
}