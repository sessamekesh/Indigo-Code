'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	test_case_dao = require('../dao/test_case_dao'),
	time_limit_dao = require('../dao/time_limit_dao');

// NEXT VERSION: Error IDs - on report error to console, attach an ID
//  so you can quickly grep for it.

// callback: result, notes
exports.judge = function (submission_id, languageData, problemData, time_limit, source_path, original_filename, callback) {
	console.log('----------CPP11 JUDGE----------');

	// Append .cpp to submission type...
	exec('mv ' + source_path + ' ' + source_path + '.cpp', { timeout: 5000 }, function(error, stdout, stder) {
		if (error) {
			console.log('ERR in moving file to add cpp extension');
			console.log('--Source Path: ' + source_path);
			console.log('--New Path: ' + source_path + '.cpp');
			console.log('--Error: ' + error);
			callback('IE', 'Internal Error (you will not be docked)');
		} else {
			compile_submission();
		}
	});

	// Compile code...
	function compile_submission() {
		var executable_name = './data/sandbox/' + submission_id + '.exe';
		var cmd = 'g++ -std=c++11 ' + source_path + '.cpp -o ' + './data/sandbox/' + submission_id + '.exe';
		exec(cmd, { timeout: 5000 }, function (error, stdout, stderr) {
			if (error) {
				console.log('ERR in buliding code: ' + error);
				callback('BE', 'Error buliding code: ' + error);
			} else {
				console.log('Result of command ' + cmd + ':');
				console.log('----stdout----');
				console.log(stdout);
				console.log('----stderr----');
				console.log(stderr);

				run_test_cases(executable_name);
			}
		});
	}

	// Run against test cases...
	function run_test_cases(executable_fname) {
		test_case_dao.getTestCases(problemData.id, function (res, err) {
			if (err) {
				console.log('Error running test cases - ' + err);
				callback('IE', 'Internal Error (you will not be docked)');
				cleanup(executable_fname);
			} else {
				run_test_case(executable_fname, 0, res);
			}
		});
	}

	function run_test_case(executable_fname, test_index, test_array) {
		if (test_index >= test_array.length) {
			cleanup(executable_fname);
			callback('AC', 'AC on ' + test_array.length + ' tests');
		} else {
			var out_file = './data/sandbox/test_result_p' + problemData.id + '_tc' + test_array[test_index].id + '_sb' + submission_id,
				cmd = './' + executable_fname + ' < ./data/test_cases/tc' + test_array[test_index].id + '.in > ' + out_file;
			// TODO KIP Modify these systems to have a max_buffer size
			var cp = exec(cmd, { timeout: time_limit }, function (error, stdout, stderr) {
				if (error) {
					if (error.signal === 'SIGTERM') {
						console.log('Error in executing command - ' + error);
						callback('TLE', 'Took too long, yo. Test case ' + (test_index + 1));
						cleanup(executable_fname);
						removeCompletedTestCase(out_file);
					} else {
						console.log('Error in executing command - ' + error);
						callback('RE', error.message);
						cleanup(executable_fname);
					}
				} else {
					console.log('cpp11: Successfully ran test case ' + test_array[test_index].id);
					compare_results(executable_fname, test_index, test_array, out_file);
				}
			});
		}
	}

	// Compare test cases...
	function compare_results(executable_fname, test_index, test_array, out_file) {
		var cmd = './data/comparison_programs/cp' + test_array[test_index].comparison_program_id
			+ ' ' + out_file + ' ' + './data/test_cases/tc' + test_array[test_index].id + '.out';
		exec (cmd, { timout: 5000 }, function (error, stdout, stderr) {
			if (error) {
				console.log('cpp11: Error running comparison program: ' + error);
				callback('IE', 'Comparison error: ' + error.message);
				cleanup(executable_fname);
			} else if (stdout[0] === 'A' && stdout[1] === 'C') {
				run_test_case(executable_fname, test_index + 1, test_array);
			} else {
				// Failed test case. Report fail here...
				callback('WA', 'Failed on test ' + (test_index + 1) + ' of ' + test_array.length + ':\n' + stdout);
				cleanup(executable_fname);
			}

			removeCompletedTestCase(out_file);
		});
	}

	function removeCompletedTestCase(out_file) {
		exec ('rm ' + out_file, { timeout: 5000 }, function (err, stdout, stderr) {
			if (err) {
				console.log('cpp11: Error removing test output: ' + out_file + ': ' + err);
			}
		});
	}

	function cleanup(executable_fname) {
		// Remove executable from sandbox...
		exec ('rm ' + executable_fname, { timeout: 5000 }, function (error, stdout, stderr) {
			if (error) {
				console.log('cpp11: Error: Could not remove executable ' + executable_fname + ': ' + error);
			}
		});
	}
}