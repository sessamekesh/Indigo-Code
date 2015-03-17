'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	execSync = require('child_process').execSync;

// Callback: result, notes
exports.judge = function (submission_id, languageData, problemData, time_limit, source_path, original_filename, test_cases) {
	console.log('-----------------PHP JUDGE-----------------');

	// Append .php to submission type...
	try {
		var stdout = execSync('mv ' + source_path + ' ' + source_path + '.php', { encoding: 'utf8', timeout: 5000 } );
	} catch (err) {
		console.log('ERR moving file to add php extension');
		console.log('--Source Path: ' + source_path);
		console.log('--New Path: ' + source_path + '.php');
		console.log('--Error: ' + err);
		return { 'res': 'IE', 'notes': 'Staging error' };
	}

	var sandbox_dir = source_path.substr(0, source_path.lastIndexOf('/'));

	// Run against test cases...
	for (var i = 0; i < test_cases.length; i++) {
		var out_file = sandbox_dir + '/test_result_p' + problemData.id + '_tc' + test_cases[i].id + '_sb' + submission_id,
			cmd = 'php ' + source_path + '.php < ' + sandbox_dir + '/tc' + test_cases[i].id + '.in > ' + out_file;
		try {
			stdout = execSync(cmd, { encoding: 'utf8', timeout: time_limit });
			var cmd_compare = sandbox_dir + '/cp' + test_cases[i].comparison_program_id
				+ ' ' + out_file + ' ' + sandbox_dir + '/tc' + test_cases[i].id + '.out';
			try {
				stdout = execSync(cmd_compare, { encoding: 'utf8', timeout: 5000 });
				if (stdout[0] === 'A' && stdout[1] === 'C') {
					console.log('--- Passed test case ' + (i + 1) + ' of ' + test_cases.length);
				} else {
					// Failed test case
					try {
						execSync('rm ' + out_file, { encoding: 'utf8', timeout: 5000 });
					} catch (err) {}
					console.log('--- Failed test case ' + (i + 1));
					console.log('--- Output: ' + stdout);
					return { 'res': 'WA', 'notes': 'Failed on test ' + (i + 1) + ' of ' + test_cases.length + ':\n' + stdout };
				}
			} catch (err) {
				console.log('php.js: Error running comparison program: ' + error + ' (test case ' + i + ')');
				try {
					execSync('rm ' + out_file, { encoding: 'utf8', timeout: 5000 });
				} catch (err) {}
				return { 'res': 'IE', 'notes': 'Comparison error: ' + error.message };
			}

		} catch (err) {
			if (err.signal === 'SIGTERM') {
				console.log('Time limit exceeded on test ' + i + '! ' + err.message);
				return {'res': 'TLE', 'notes': 'Test case ' + i + ' took too long to execute.' };
			} else {
				console.log('php.js: Error (test case ' + i + ') in executing command ' + cmd + ': ' + err);
				return {'res': 'RE', 'notes': err.message };
			}
		}
		try {
			execSync('rm ' + out_file, { encoding: 'utf8', timeout: 5000 });
		} catch (err) {}
	}
	
	console.log('-----------------PASSED-----------------');
	return { 'res': 'AC', 'notes': 'AC on ' + test_cases.length + ' tests.' };
};