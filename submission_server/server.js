'use strict';

var submission_number = 0,
	net = require('net'),
	fs = require('fs'),
	port = 8080,
	owl_router = require('./owl_router'),
	exec = require('child_process').exec;

var server = net.createServer({ allowHalfOpen: true }, function (conn) {
	var fname = './' + submission_number + '.tar.gz';
	var outfile = fs.createWriteStream(fname);
	submission_number++;

	console.log('Client connected...');
	conn.on('end', function() {
		console.log('Client signaled they are ready to be done.');
		conn.unpipe(outfile);
		outfile.end();

		console.log('Entering judge subsystem...');

		judgeSubmission(fname, function (res) {
			conn.write(JSON.stringify(res));
		});

		conn.write(JSON.stringify({'result': 'AC', 'notes': 'ping, stupid'}));
		conn.end();
	});

	conn.pipe(outfile);
});

server.listen(port, function () {
	console.log('Submission server created, listening on port ' + port);
});

function judgeSubmission(fname, callback) {
	
}