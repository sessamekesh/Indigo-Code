'use strict';

var fs = require('fs');

function loadFromFile(response, fileName, responseType) {
	fs.readFile(fileName, function (err, data) {
		if (err) {
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.write('File not found!');
			response.end();
		} else {
			response.writeHead(200, {'Content-Type': responseType});
			response.write(data);
			response.end();
		}
	});
}

exports.loadFromFile = loadFromFile;