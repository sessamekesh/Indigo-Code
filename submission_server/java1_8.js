'use strict';

var fs = require('fs'),
	exec = require('child_process').exec;

// Callback: result, notes
exports.judge = function (submission_id, languageData, problemData, time_limit, source_path, original_filename, test_cases, callback) {
	console.log('----------JAVA 8 JUDGE----------');

	var new_path;

	var sandbox_dir = source_path.substr(0, source_path.lastIndexOf('/'));

	// Make a directory for this submission in the sandbox...
	console.log('java1_8.js: Making directory ' + sandbox_dir + '/poor_java_fool_' + submission_id);
	exec('mkdir ' + sandbox_dir + '/poor_java_fool_' + submission_id, { timeout: 5000 }, function (err, stdout, stderr) {
		if (err) {
			console.log('java1_8.js: ERR creating submission directory in sandbox: ' + err);
			callback('IE', 'Could not create directory in which to place Java submission');
		} else {
			moveFile();
		}
	});

	function moveFile() {
		// Move file to directory, using original filename as filename
		new_path = sandbox_dir + '/poor_java_fool_' + submission_id + '/' + original_filename;
		console.log('java1_8.js: Moving file to ' + new_path);
		exec ('cp ' + source_path + ' ' + new_path, { timeout: 5000 },
			function (err, stdout, stderr) {
				if (err) {
					console.log('java1_8.js: ERR moving file to new directory: ' + err);
					callback('IE', 'Could not move file into new Java directory: ' + new_path);
					cleanup();
				} else {
					build_class();
				}
			}
		);
	}

	function build_class() {
		var className = new_path.substr(new_path.lastIndexOf('/') + 1);
			className = className.substr(0, className.lastIndexOf('.'));
		console.log('java1_8.js: Building class ' + className);
		exec('./bin/jdk1.8.0_31/bin/javac ' + new_path, { timeout: 5000 }, function (err, stdout, stderr) {
			if (err) {
				console.log('java1_8: Build error: ' + err);
				callback('BE', 'Could not build project: ' + err);
				cleanup();
			} else {
				run_test_cases(className, new_path.substr(0, new_path.lastIndexOf('/')));
			}
		});
	}

	// Run against test cases...
	function run_test_cases(class_name, wd) {
		run_test_case(class_name, wd, 0, test_cases);
	}

	function run_test_case(class_name, wd, test_index, test_array) {
		if (test_index >= test_array.length) {
			cleanup();
			cleanup_and_report_success(test_array);
		} else {
			var out_file = '../../../' + sandbox_dir + '/test_result_p' + problemData.id + '_tc' + test_array[test_index].id + '_sb' + submission_id,
				cmd = '../../../bin/jdk1.8.0_31/bin/java ' + class_name + ' < ../../../' + sandbox_dir + '/tc' + test_array[test_index].id + '.in > ' + out_file;
			exec(cmd, { timeout: time_limit, cwd: wd }, function (err, stdout, stderr) {
				if (err) {
					if (err.signal === 'SIGTERM') {
						console.log('Time limit exceeded! ' + err.message);
						callback('TLE', 'Took too long, yo. Test case ' + (test_index + 1));
						removeCompletedTestCase(out_file, wd);
						cleanup();
					} else {
						console.log('java1_8.js: Error in executing command ' + cmd + ': ' + err);
						callback('RE', err.message);
						cleanup();
					}
				} else {
					compare_results(class_name, wd, test_index, test_array, out_file);
				}
			});
		}
	}

	function removeCompletedTestCase(out_file, wd) {
		exec ('rm ' + out_file, { timeout: 5000, cwd: wd }, function (err, stdout, stderr) {
			if (err) {
				console.log('java1_8: Error removing test output: ' + out_file + ': ' + err);
			}
		});
	}

	function compare_results(class_name, wd, test_index, test_array, out_file) {
		var cmd = '../../../' + sandbox_dir +'/cp' + test_array[test_index].comparison_program_id
			+ ' ' + out_file + ' ' + '../../../' + sandbox_dir + '/tc' + test_array[test_index].id + '.out';
		exec(cmd, { timeout: 5000, cwd: wd }, function (error, stdout, stderr) {
			if (error) {
				console.log('java1_8.js: Error running comparison program: ' + error);
				callback('IE', 'Comparison error: ' + error.message);
				cleanup();
			} else if (stdout[0] === 'A' && stdout[1] === 'C') {
				run_test_case(class_name, wd, test_index + 1, test_array);
			} else {
				// Failed test case
				callback('WA', 'Failed on test ' + (test_index + 1) + ' of ' + test_array.length + ':\n' + stdout);
				console.log('Wrong Answer: ' + stdout);
				cleanup();
			}

			removeCompletedTestCase(out_file, wd);
		});
	}

	function cleanup(test_array) {
		// HACK: Waits a second, before going along with it, because of a bug
		//  sometimes caused by friggin Java.
		setTimeout(function () {
			console.log('Removing: ' + new_path + ' and ' + new_path.substr(0, new_path.lastIndexOf('.')) + '.class');
			exec ('rm ' + new_path + ' ' + new_path.substr(0, new_path.lastIndexOf('.')) + '.class', { timeout: 5000 }, function (error, stdout, stderr) {
				if (error) {
					console.log('java1_8.js: Error: Could not remove executable ' + new_path + ': ' + error);
				}
			});

			exec ('rmdir ' + new_path.substr(0, new_path.lastIndexOf('/')), { timeout: 5000 }, function (error, stdout, stderr) {
				if (error) {
					console.log('java1_8.js: Error: Could not remove directory ' + new_path.substr(0, new_path.lastIndexOf('/')) + ': ' + error);
				}
			});
		}, 1000);
	}

	function cleanup_and_report_success(test_array) {
		callback('AC', 'AC on ' + test_array.length + ' tests');
	}
}
// TODO KIP: Write function test (model after cpp98)