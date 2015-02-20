'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	test_case_dao = require('../dao/test_case_dao'),
	time_limit_dao = require('../dao/time_limit_dao');

// NEXT VERSION: Error IDs - on report error to console, attach an ID
//  so you can quickly grep for it.

// callback: result, notes
exports.judge = function (submission_id, languageData, problemData, source_path, original_filename, callback) {
	console.log('----------CPP98 JUDGE----------');

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
		var cmd = 'g++ -std=c++98 ' + source_path + '.cpp -o ' + './data/sandbox/' + submission_id + '.exe';
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

				getTimeLimit(executable_name);
			}
		});
	}

	function getTimeLimit(executable_fname) {

		time_limit_dao.getTimeLimit(problemData.id, languageData.id, function (res, err) {
			if (err) {
				callback('IE', 'Failed to get time limit: ' + err);
			} else if (res === 'USE_DEFAULT') {
				run_test_cases(executable_fname, problemData.time_limit);
			} else {
				run_test_cases(executable_fname, res);
			}
		});
	}

	// Run against test cases...
	function run_test_cases(executable_fname, time_limit) {
		test_case_dao.getTestCases(problemData.id, function (res, err) {
			if (err) {
				console.log('Error running test cases - ' + err);
				callback('IE', 'Internal Error (you will not be docked)');
			} else {
				run_test_case(executable_fname, time_limit, 0, res);
			}
		});
	}

	function run_test_case(executable_fname, time_limit, test_index, test_array) {
		if (test_index >= test_array.length) {
			cleanup_and_report_success(executable_fname, test_array);
		} else {
			var out_file = './data/sandbox/test_result_p' + problemData.id + '_tc' + test_array[test_index].id,
				cmd = './' + executable_fname + ' < ./data/test_cases/tc' + test_array[test_index].id + '.in > ' + out_file;
			exec(cmd, { timeout: time_limit }, function (error, stdout, stderr) {
				if (error) {
					console.log('Error in executing command - ' + error);
					callback('RE', error.message);
				} else {
					console.log('cpp98: Successfully ran test case ' + test_array[test_index].id);
					compare_results(executable_fname, time_limit, test_index, test_array, out_file);
				}
			});
		}
	}

	// Compare test cases...
	function compare_results(executable_fname, time_limit, test_index, test_array, out_file) {
		var cmd = './data/comparison_programs/cp' + test_array[test_index].comparison_program_id
			+ ' ' + out_file + ' ' + './data/test_cases/tc' + test_array[test_index].id + '.out';
		exec (cmd, { timout: 5000 }, function (error, stdout, stderr) {
			if (error) {
				console.log('cpp98: Error running comparison program: ' + error);
				callback('TE', error.message);
			} else if (stdout[0] == 'A' && stdout[1] == 'C') {
				run_test_case(executable_fname, time_limit, test_index + 1, test_array);
			} else {
				// Failed test case. Report fail here...
				callback('WA', stdout);
			}
		});
	}

	function cleanup_and_report_success(executable_fname, test_array) {
		// TODO KIP: Remove the executable and test cases from
		//  the sandbox.
		callback('AC', 'AC on ' + test_array.length + ' tests');
	}
}