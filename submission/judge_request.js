'use strict';

// NEXT VERSION: Implement a throttling feature, in case the buffer size
//  grows too large.

var language_dao = require('../dao/language_dao'),
	net = require('net'),
	fs = require('fs'),
	exec = require('child_process').exec,
	test_case_dao = require('../dao/test_case_dao'),
	time_limit_dao = require('../dao/time_limit_dao'),
	wait_block = false;

var submission_server_data = {
	host: '192.168.56.101',
	//host: '129.123.210.40',
	port: 8080
},
	SUBMISSION_TIMOUT = 45000,
	last_submission_time = Date.now(),
	vm_inactive_lifetime = 1000 * 60 * 8, // 8 minutes
	vm_active = false;

// TODO KIP: Move these to a configuration file of sorts.
//  Virtual machines... hooray...
// TODO KIP: There is a way to spawn virtual machines, but not
//  to shut them down... change this...
var vm_name = 'SubmissionServer64',
	snapshot_name = 'Server64 Startup';

// Callback: result, notes, err
//  The notes out of this function will be user-facing.
exports.judgeSubmission = function (submission_id, languageData, problemData, source_path, original_filename, callback) {
	console.log('judge_request: Submission received for judgement: ' + submission_id + ' on problem ' + problemData.name);

	var submission_socket;

	// System that shuts down VM after 5 minutes of complete inactivity...
	last_submission_time = Date.now();
	if (vm_active === false) {
		setTimeout(check_vm_timeout, vm_inactive_lifetime * 1.3);
	}

	function check_vm_timeout() {
		console.log('judgeSubmission: Checking for VM timeout...');
		if ((Date.now() - last_submission_time) > vm_inactive_lifetime) {
			console.log('judgeSubmission: Closing VM');
			exec('VBoxManage controlvm \'' + vm_name + '\' poweroff');
		} else {
			console.log('Last submission was ' + ((Date.now() - last_submission_time) / 1000) + ' seconds ago, waiting.');
			setTimeout(check_vm_timeout, vm_inactive_lifetime * 1.3);
		}
	}

	check_can_start();

	function check_can_start() {
		if (wait_block === true) {
			// TODO KIP: Verify this, this could be a huge source of bugs...
			setTimeout(check_can_start, 800);
		} else {
			enum_vms(create_connection);
		}
	}

	// (0) Make sure VM is running...
	function enum_vms(cb) {
		exec('VBoxManage list runningvms', function (error, stdout, stderr) {
			if (error) {
				console.log('judge_request: Could not check VMs: ' + error);
				callback('IE', 'Could not verify VM with server is running');
			} else {
				// Scan output for the VM we want...
				if (stdout.search(vm_name) < 0) {
					// Try to create VM...
					console.log('judge_request: Restoring VM...');
					restore_vm_snapshot(cb, callback);
				} else {
					console.log('judge_request: VM found, creating connection');
					cb();
				}
			}
		});
	}

	function restore_vm_snapshot(cb, cb2) {
		exec('VBoxManage snapshot \'' + vm_name + '\' restore \'' + snapshot_name + '\'',
			function (error, stdout, stderr) {
				if (error) {
					console.log('judge_request: Could not restore VM snapshot: ' + error);
					cb2('IE', 'Could not reboot VM...');
				} else {
					start_vm(cb, cb2);
				}
			}
		);
	}

	function start_vm(cb, cb2) {
		exec('VBoxManage startvm \'' + vm_name + '\'',
			function (error, stdout, stderr) {
				if (error) {
					console.log('judge_request: Could not start VM: ' + error);
					cb2('IE', 'Could not reboot VM...');
				} else {
					// TODO KIP: Make it so that this doesn't have to be so terribly
					//  long...
					vm_active = true;
					setTimeout(cb, 2000);
				}
			}
		);
	}

	// (1) Try to create a connection to the server specified
	function create_connection() {
		submission_socket = net.createConnection(submission_server_data.port, submission_server_data.host);
		console.log('---judge_request ' + submission_id + ': Socket created');
		submission_socket.on('connect', function() {
			console.log('---judge_request ' + submission_id + ': Socket connected');
			gather_resources();
		}).on('end', function() {
			console.log('---judge_request ' + submission_id + ': Socket closed');
		}).on('error', function(err) {
			// This VERY LIKELY means the VM has been fork bombed.
			//  Notify the user, and restart the vm.
			console.log('---judge_request ' + submission_id + ': Error opening socket: ' + err);
			wait_block = true;
			exec('VBoxManage controlvm \'' + vm_name + '\' poweroff', { timeout: 15000 }, function (error, stdout, stderr) {
				if (error) {
					if (error.signal === 'SIGTERM') {
						console.log('judge_request: Shutdown of server took too long!');
						wait_block = false;
					} else {
						console.log('judge_request: Shutdown of server failed! ' + error);
						wait_block = false;
					}
				} else {
					restore_vm_snapshot(function() {
						wait_block = false;
					}, function (junk, error) {
						console.log('judge_request: Could not reboot server: ' + error);
						wait_block = false;
					});
				}
			});
			callback('IE', 'Could not connect to server. Attempting server reboot, try again in a few seconds (will never take more than 30 seconds)...');
		});
	}

	// (2) Gather all resources required to judge submission
	//  Test data
	//  Comparison program
	//  Source files
	//  Submission JSON data
	function gather_resources() {
		// Create new dirname with this submission
		var dirname = './data/sandbox/SUB_' + submission_id;
		exec('mkdir ' + dirname, { timeout: 5000 },
			function (error, stdout, stderr) {
				if (error) {
					console.log('---judge_request ' + submission_id + ': ERR creating dirname for package: ' + error);
					callback('IE', 'Could not create submission directory (S' + submission_id + ')');
				} else {
					// Successfully made directory. Now, move all resources there...
					move_source_file();
				}
			});

		function move_source_file() {
			exec('cp ' + source_path + ' ' + dirname + '/SRC', { timeout: 5000 },
				function (error, stdout, stderr){
					if (error) {
						console.log('---judge_request ' + submission_id + ': ERR moving source to new directory: ' + error);
						callback('IE', 'Could not move source data to submission package (S' + submission_id + ')');
					} else {
						// Successfully moved source file. Move on to testing stuff...
						get_test_case_data();
					}
				});
		}

		function get_test_case_data() {
			test_case_dao.getTestCases(problemData.id, function (res, err) {
				if (err) {
					console.log('---judge_request ' + submission_id + ': Error gather test case data: ' + err);
					callback('IE', 'Could not get test case data for submission ' + submission_id + ' (problem ' + problemData.id + ')');
				} else {
					gather_test_case(res, 0);
				}
			});
		}

		function gather_test_case(test_array, test_index) {
			if (test_index >= test_array.length) {
				// Success - gathered all test cases, go on to provide JSON data
				get_time_limit(test_array);
			} else {
				// Two commands: Gather the actual test data itself,
				//  and then also gather the attached comparison program.
				var test_case_name = './data/test_cases/tc' + test_array[test_index].id + '.*';
				exec('cp ' + test_case_name + ' ' + dirname + '/',
					{ timeout: 5000 }, function (error, stdout, stderr) {
						if (error) {
							console.log('---judge_request ' + submission_id + ': ERR moving test case ' + test_array[test_index].id + ': ' + error);
							callback('IE', 'Could not move test case data to submission package (S' + submission_id + ')');
						} else {
							exec('cp ./data/comparison_programs/cp' + test_array[test_index].comparison_program_id + ' ' + dirname + '/cp' + test_array[test_index].comparison_program_id,
								{ timeout: 5000 }, function (error, stdout, stderr) {
									if (error) {
										console.log('---judge_request ' + submission_id + ': ERR moving comparison program ' + test_array[test_index].id + ': ' + error);
									} else {
										gather_test_case(test_array, test_index + 1);
									}
								});
						}
					});
			}
		}

		function get_time_limit(test_array) {
			time_limit_dao.getTimeLimit(problemData.id, languageData.id, function (res, err) {
				if (err) {
					console.log('---judge_request ' + submission_id + ': ERR could not get time limit');
					callback('IE', 'Could not get time limit using language ' + languageData.name + ' on problem ' + problemData.name + ' (S' + submission_id + ')');
				} else {
					if (res === 'USE_DEFAULT') {
						export_json_data(test_array, problemData.time_limit);
					} else {
						export_json_data(test_array, res);
					}
				}
			});
		}

		function export_json_data(test_array, time_limit) {
			var to_export = {
				test_data: test_array,
				package_name: 'SUB_' + submission_id,
				submission_id: submission_id,
				languageData: languageData,
				problemData: problemData,
				time_limit: time_limit,
				original_filename: original_filename
			};

			fs.writeFile(dirname + '/submission.json', JSON.stringify(to_export), function (err) {
				if (err) {
					console.log('---judge_request ' + submission_id + ': ERR exporting JSON package data: ' + err);
					callback('IE', 'Could not write package JSON for submission server (S' + submission_id + ')');
				} else {
					create_package(to_export, dirname);
				}
			});
		}
	}

	// (3) Create a submission package with that data (compressed file)
	function create_package(package_data, dirname) {
		var tarball_name = package_data.package_name + '.tar.gz';
		exec('tar cvzf ' + tarball_name + ' ' + package_data.package_name + '/',
			{ timeout: 5000, cwd: './data/sandbox/' },
			function (error, stdout, stderr) {
				if (error) {
					console.log('---judge_request ' + submission_id + ': ERR compressing package: ' + error);
					callback('IE', 'Could not prepare package to send to submission server: Could not compress (S' + submission_id + ')');
				} else {
					send_package(package_data, tarball_name, dirname);
				}
			});
	}

	// (5) Send submission package across the network
	// (7) Listen for results. On results received, mark submission
	//  answer.
	function send_package(package_data, tarball_name, dirname) {

		var package_in_stream = fs.createReadStream('./data/sandbox/' + tarball_name),
			json_return_string = '';
		// TODO KIP: Change this to piping, you're not sure you receive all data...
		submission_socket.on('data', function (dat) { json_return_string += dat; });
		submission_socket.on('end', function () { report_result_received(json_return_string); });
		package_in_stream.on('error', function (err) {
			console.log('---judge_request ' + submission_id + ': ERR streaming data: ' + err);
		});
		package_in_stream.on('open', function() {
			package_in_stream.pipe(submission_socket);
			package_in_stream.on('end', function() {
				console.log('---judge_request ' + submission_id + ': Finished writing to socket');
				cleanup(tarball_name, dirname);
			});
		});
	}

	// (6) Cleanup submission package and directory from sandbox.
	function cleanup(tarball_name, dirname) {
		if (dirname === undefined || dirname === null || dirname === '.' || dirname === '/' || dirname === '~' || dirname === '') {
			return;
		}

		exec('rm -r ' + dirname + './data/sandbox/' + tarball_name,
			function (error, stdout, stderr) {
				if (error) {
					console.log('---judge_request ' + submission_id + ': Error cleaning up sandbox: ' + error);
				}
			});
	}

	function report_result_received(data) {
		console.log('---judge_request ' + submission_id + ': Result received: ' + data);
		try {
			var result = JSON.parse(data);
			callback(result.result, result.notes);
		} catch (e) {
			callback('IE', 'Response from server was corrupted. Re-submit to try again (this submission is not counted against your score)');
		}
	}
}