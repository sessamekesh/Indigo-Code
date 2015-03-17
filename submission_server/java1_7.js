'use strict';

var fs = require('fs'),
	exec = require('child_process').exec,
	execSync = require('child_process').execSync;

// Callback: result, notes
exports.judge = function (submission_id, languageData, problemData, time_limit, source_path, original_filename, test_cases) {
	console.log('-----------------JAVA 1.7 JUDGE-----------------');

	// Append .go to submission type...
	var sandbox_dir = source_path.substr(0, source_path.lastIndexOf('/')),
		new_path = sandbox_dir + '/' + original_filename,
		classname = new_path.substr(new_path.lastIndexOf('/') + 1);
	classname = classname.substr(0, classname.lastIndexOf('.'));
	try {
		var stdout = execSync('mv ' + source_path + ' ' + new_path, { encoding: 'utf8', timeout: 5000 } );
	} catch (err) {
		console.log('ERR moving file to add go extension');
		console.log('--Source Path: ' + source_path);
		console.log('--New Path: ' + source_path + '.go');
		console.log('--Error: ' + err);
		return { 'res': 'IE', 'notes': 'Staging error' };
	}

	var cmd = './bin/jdk1.7.0_75/bin/javac ' + new_path;
	try {
		execSync(cmd, { timeout: 5000, encoding: 'utf8' });
	} catch (error) {
		console.log('golang.js: ERR in building code: ' + error);
		return { 'res': 'BE', 'notes': 'Error in building code: ' + error };
	}

	// Run against test cases...
	for (var i = 0; i < test_cases.length; i++) {
		var out_file = './test_result_p' + problemData.id + '_tc' + test_cases[i].id + '_sb' + submission_id,
			cmd = '../../bin/jdk1.7.0_75/bin/java ' + classname + ' < ' + './tc' + test_cases[i].id + '.in > ' + out_file;
		try {
			stdout = execSync(cmd, { encoding: 'utf8', timeout: time_limit, cwd: sandbox_dir });
			var cmd_compare = sandbox_dir + '/cp' + test_cases[i].comparison_program_id
				+ ' ' + sandbox_dir +  '/' + out_file + ' ' + sandbox_dir + '/tc' + test_cases[i].id + '.out';
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
				console.log('golang.js Error running comparison program: ' + error + ' (test case ' + i + ')');
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
				console.log('golang.js Error (test case ' + i + ') in executing command ' + cmd + ': ' + err);
				return {'res': 'RE', 'notes': err.message };
			}
		}
		try {
			execSync('rm ' + sandbox_dir + '/' + out_file, { encoding: 'utf8', timeout: 5000 });
		} catch (err) {}
	}
	
	console.log('-----------------PASSED-----------------');
	return { 'res': 'AC', 'notes': 'AC on ' + test_cases.length + ' tests.' };
};