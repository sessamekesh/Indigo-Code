'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	execSync = require('child_process').execSync;

// Callback: result, notes
exports.judge = function (submission_id, languageData, problemData, time_limit, source_path, original_filename, test_cases, callback) {
	console.log('----------PHP JUDGE----------');

	// Append .php to submission type...
	exec('mv ' + source_path + ' ' + source_path + '.php', { timeout: 5000 }, function (err, stdout, stderr) {
		if (err) {
			console.log('ERR moving file to add php extension');
			console.log('--Source Path: ' + source_path);
			console.log('--New Path: ' + source_path + '.php');
			console.log('--Error: ' + err);
			callback('IE', 'Staging error');
		} else {
			run_test_cases();
		}
	});

	var sandbox_dir = source_path.substr(0, source_path.lastIndexOf('/'));

	// Run against test cases...
	function run_test_cases() {
		run_test_case(0, test_cases);
	}

	function run_test_case(test_index, test_array) {
		if (test_index >= test_array.length) {
			cleanup_and_report_success(test_array);
		} else {
			var out_file = sandbox_dir + '/test_result_p' + problemData.id + '_tc' + test_array[test_index].id + '_sb' + submission_id,
				cmd = 'php ' + source_path + '.php < ' + sandbox_dir + '/tc' + test_array[test_index].id + '.in > ' + out_file;
			try {
				var result = execSync(cmd, { timeout: time_limit });
				compare_results(test_index, test_array, out_file);
			} catch (err) {
				if (err.signal === 'SIGTERM') {
					console.log('Time limit exceeded! ' + err.message);
					callback('TLE', 'Took too long, yo. Test case ' + (test_index + 1));
					removeCompletedTestCase(out_file);
				} else {
					console.log('php.js: Error in executing command ' + cmd + ': ' + err);
					callback('RE', err.message);
					removeCompletedTestCase(out_file);
				}
			}
		}
	}

	function compare_results(test_index, test_array, out_file) {
		var cmd = sandbox_dir + '/cp' + test_array[test_index].comparison_program_id
			+ ' ' + out_file + ' ' + sandbox_dir + '/tc' + test_array[test_index].id + '.out';
		exec(cmd, { timeout: 5000 }, function (error, stdout, stderr) {
			if (error) {
				console.log('php.js: Error running comparison program: ' + error);
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
				console.log('php.js: Error removing test output: ' + out_file + ': ' + err);
			}
		});
	}

	function cleanup_and_report_success(test_array) {
		callback('AC', 'AC on ' + test_array.length + ' tests.');
	}
}