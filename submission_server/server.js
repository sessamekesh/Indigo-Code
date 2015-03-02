'use strict';

var submission_number = 0,
	net = require('net'),
	fs = require('fs'),
	port = 8080,
	owl_router = require('./owl_router'),
	exec = require('child_process').exec,
	entities = require('entities');

var server = net.createServer({ allowHalfOpen: true }, function (conn) {
	var fname = './sandbox/' + submission_number + '.tar.gz';
	var outfile = fs.createWriteStream(fname);
	submission_number++;

	console.log('Client connected...');
	conn.on('end', function() {
		console.log('Client signaled they are ready to be done.');
		conn.unpipe(outfile);
		outfile.end();

		console.log('Entering judge subsystem...');

		judgeSubmission(fname, function (res, notes) {
			conn.write(JSON.stringify({ 'result': res, 'notes': notes }));
			conn.end();
		});
	});

	conn.pipe(outfile);
});

server.listen(port, function () {
	console.log('Submission server created, listening on port ' + port);
});

function judgeSubmission(fname, callback) {
	// (1) Unzip submission
	var submission_dir = './sandbox/';
	exec('tar -zxvf ../' + fname, { cwd: './sandbox' }, function (error, stdout, stderr) {
		if (error) {
			console.log('judgeSubmission error: Could not unzip archive: ' + error);
			callback('IE', 'Could not open package on submission server');
		} else {
			submission_dir += stdout.split('\n')[0];
			console.log(submission_dir);
			read_package_data();
		}
	});

	// (2) Read in package data, to send on to owl subsystem...
	function read_package_data() {
		fs.readFile(submission_dir + 'submission.json', function (err, data) {
			if (err) {
				console.log('judgeSubmission error: Could not read package JSON: ' + err);
				callback('IE', 'Could not read submission package data');
			} else {
				judge(JSON.parse(data), fname);
			}
		});
	}

	// (3) Judge!
	function judge(package_data, tarball_path) {
		owl_router.judgeSubmission(package_data.submission_id, package_data.languageData,
			package_data.problemData, submission_dir + 'SRC', package_data.original_filename,
			package_data.time_limit, package_data.test_data,
			function (res, notes, err) {
				if (err) {
					console.log('judgeSubmission ERR: Error judging submission: ' + err);
				} else {
					callback(entities.encodeHTML(res), entities.encodeHTML(notes));
				}

				// Either way, remove the directory we were using...
				exec ('rm -r ' + submission_dir + ' ' + tarball_path, function (err, stdout, stderr) {
					if (err) {
						console.log('judgeSubmission ERR: Could not cleanup directory: ' + err);
					}
				});
			}
		);
	}
}