'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	test_case_dao = require('../dao/test_case_dao');

// Callback: result, notes
exports.judge = function (submission_id, languageData, problemData, time_limit, source_path, original_filename, callback) {
	console.log('----------PYTHON JUDGE----------');

	// Append .py to submission type...
	exec('mv ' + source_path + ' ' + source_path + '.py', { timeout: 5000 }, function (err, stdout, stderr) {
		if (err) {
			console.log('ERR moving file to add py extension');
			console.log('--Source Path: ' + source_path);
			console.log('--New Path: ' + source_path + '.cpp');
			console.log('--Error: ' + err);
			callback('IE', 'Staging error');
		} else {
			run_test_cases();
		}
	});

	// Run against test cases...
	function run_test_cases() {
		test_case_dao.getTestCases(problemData.id, function (res, err) {
			if (err) {
				console.log('python: Error retreiving test cases - ' + err);
				callback('IE', 'Error retreiving list of test cases');
			} else {
				run_test_case(0, res);
			}
		});
	}

	function run_test_case(test_index, test_array) {
		if (test_index >= test_array.length) {
			cleanup_and_report_success(test_array);
		} else {
			var out_file = './data/sandbox/test_result_p' + problemData.id + '_tc' + test_array[test_index].id + '_sb' + submission_id,
				cmd = 'python ' + source_path + '.py < ./data/test_cases/tc' + test_array[test_index].id + '.in > ' + out_file;
			exec(cmd, { timeout: time_limit }, function (err, stdout, stderr) {
				if (err) {
					if (err.signal === 'SIGTERM') {
						console.log('Time limit exceeded! ' + err.message);
						callback('TLE', 'Took too long, yo. Test case ' + (test_index + 1));
						removeCompletedTestCase(out_file);
					} else {
						console.log('python.js: Error in executing command ' + cmd + ': ' + err);
						callback('RE', err.message);
						removeCompletedTestCase(out_file);
					}
				} else {
					compare_results(test_index, test_array, out_file);
				}
			});
		}
	}

	function compare_results(test_index, test_array, out_file) {
		var cmd = './data/comparison_programs/cp' + test_array[test_index].comparison_program_id
			+ ' ' + out_file + ' ' + './data/test_cases/tc' + test_array[test_index].id + '.out';
		exec(cmd, { timeout: 5000 }, function (error, stdout, stderr) {
			if (error) {
				console.log('python.js: Error running comparison program: ' + error);
				callback('IE', 'Comparison error: ' + error.message);
			} else if (stdout[0] === 'A' && stdout[1] === 'C') {
				run_test_case(test_index + 1, test_array);
			} else {
				// Failed test case
				callback('WA', 'Failed on test ' + (test_index + 1) + ' of ' + test_array.length + ':\n' + stdout);
			}

			removeCompletedTestCase(out_file);
		});

	}

	function removeCompletedTestCase(out_file) {
		exec ('rm ' + out_file, { timeout: 5000 }, function (err, stdout, stderr) {
			if (err) {
				console.log('python.js: Error removing test output: ' + out_file + ': ' + err);
			}
		});
	}

	function cleanup_and_report_success(test_array) {
		callback('AC', 'AC on ' + test_array.length + ' tests');
	}
}