'use strict';

var fs = require('fs'),
	kokiriPage = require('../kokiriPage'),
	kokiriUserTab = require('../kokiriUserTab'),
	kokiriHeader = require('../kokiriHeader'),
	competitionSidebar = require('./competitionSidebar'),
	mysql = require('mysql'),
	exec = require('child_process').exec;

var index = 0;
var queue = 1;

// Callback: (outputPage, err)
// Creates the page that is shown to the user.
function CreateSubmissionJudgePage(userData, submissionDesc, submissionPath, fileName, callback) {
	console.log('Creating a submission judge page...');
	console.log(submissionDesc);
	// Move the submission into the predicted path...
	// TODO: Move this functionality somewhere else.
	index += 1;
	var newPath = './competitions/submissions/' + index + '_' + fileName;
	fs.rename(submissionPath, newPath, function(error) {
		if (error) {
			fs.unlink(newPath);
			fs.rename(submissionPath, newPath, function(error) {
				if (error) {
					console.log('Unable to save submission page - ' + error);
					callback(null, error);
				}
			});
		}
	});

	// Add the submission description and data to the judgement queue:
	var queuePosition = queue;

	// Start the judgement process!
	JudgeSubmission(userData, submissionDesc, newPath, function(result, err) {
		if (err) {
			console.log('Error in judging submission for ' + userData.username + ': ' + err);
		} else {
			console.log('Judgement for submission by ' + userData.username + ' completed successfully!');
			console.log('Result: ');
			console.log(result);
		}
	});

	// This may cause an issue.
	// delete userData.submitting_for;

	callback(kokiriPage.KokiriPage({
		title: '(Kokiri) Submission accepted!',
		stylesheet: './style.css',
		header: kokiriHeader.KokiriHeader({
			titleText: 'Submission accepted!',
			subtitleText: 'Kokiri is too early a prototype for fancy handling of it though.',
			userInfo: kokiriUserTab.GenerateUserTab(userData)
		}),
		sidebar: competitionSidebar.GenerateSidebarFromDesc(userData, { n: userData.submitting_for.comp_id }),
		body: {
			render: function(callback) {
				callback('<p>Submission received! It is being judged, it is ' + queuePosition + ' in the queue.</p>'
					+ '\n<p>When it is finished, it will show up on the page. Probably. This is a pretty early prototype.</p>'
					+ '\n<p>Click <a href="/submissions?n=' + userData.submitting_for.comp_id + '">here</a> for submissions list</p>');
			}
		}
	}));
}

// Actually judges the submission
// callback: performed when the judgement is finished successfully
// TODO: Do all this over on a VM
function JudgeSubmission(userData, submissionDesc, submissionPath, callback) {
	queue++;
	console.log('Judging submission for ' + userData.username);
	console.log('Submission details:');
	console.log(submissionDesc);
	console.log('Pathname: ' + submissionPath);

	// Get the commands to run the test
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	var commandQuery = connection.query('SELECT lang_command FROM Languages WHERE id = ?;', submissionDesc.lang_id);
	var commands;
	commandQuery.on('error', function(err) {
		callback(null, err);
	});
	commandQuery.on('result', function(res) {
		// Split by newline - all but last command are involved in build.
		commands = res.lang_command.split('\n');
	});
	commandQuery.on('end', function() {
		performBuildCommands(commands);
	});

	// Perform build commands
	// Report any build errors
	var performBuildCommands = function(commands) {
		console.log('Performing the build commands - commands given are');
		console.log(commands);
		var working_dir = submissionPath.substr(0, submissionPath.lastIndexOf('/') + 1);
		var submissionFile = submissionPath.substr(submissionPath.lastIndexOf('/') + 1);
		var executableFile = submissionFile.substr(0, submissionFile.lastIndexOf('.'));
		if (commands.length > 1) {
			for (var i = 0; i < commands.length - 1; i++) {
				var toExec = commands[i].trim().replace("$SRC", submissionFile).replace("$OUT", executableFile);
				// Replace $SRC with the pathname of the file,
				//  replace $OUT with pathname + 'compd'
				console.log('Preparing to execute in directory ' + working_dir + ':');
				console.log(toExec);

				exec(toExec, { cwd: working_dir, timeout: 5000 }, function(error, stdout, stderr) {
					if (error) {
						// BUILD ERRORS GO HERE
						console.log('Error in executing command - ' + error);
						reportSubmission('BE', error, working_dir + submissionFile);
					} else {
						// Check stdout, stderr
						// No clue what goes into those ones.
						console.log('Result of command ' + toExec + ':');
						console.log('--stdout: ' + stdout);
						console.log('--stderr: ' + stderr);

						// Call the 'run tests' function here.
						runTests(working_dir, executableFile, commands[commands.length - 1].trim(), working_dir + submissionFile);
					}
				});
			}
		} else {
			// No build steps - skip straight to running tests.
			// Call the 'run tests' function here.
			runTests(working_dir, executableFile, commands[commands.length - 1].trim(), working_dir + submissionFile);
		}
	}

	// Perform run command with all test cases
	// Report any run errors on any test case
	// Compare expected outputs with observed outputs
	// TODO: Copy all test files into a different directory, test there (for security)
	function runTests(workingDirectory, executableFile, executeCommand, source_file) {

		console.log('Beginning running of the tests in working directory ' + workingDirectory);
		console.log('Execute command: ' + executeCommand);

		var testDirectory = './competitions/c' + submissionDesc.comp_id + '/p' + submissionDesc.problem_id + '/';
		runTest(0);

		function runTest(testNumber) {
			console.log('Attempting to run test ' + testNumber);
			console.log('Searching for infile at ' + testDirectory + testNumber + '.in');
			fs.exists(testDirectory + testNumber + '.in', function(exists) {
				if (exists) {
					// Run test
					var infile = testDirectory + testNumber + '.in';
					var testfile = testDirectory + testNumber + '.test';
					var outfile = testDirectory + testNumber + '.out';
					var commandToExecute = executeCommand.replace('$INFILE', infile)
						.replace('$OUT', workingDirectory + '/' + executableFile).replace('$OFILE', testfile)
						.replace('$SRC', source_file);
					console.log('Getting ready to execute command: ' + commandToExecute);						

					// Actually execute the command...
					exec(commandToExecute, { timeout: 5000 }, function(error, stdout, stderr) {
						if (error) {
							console.log('Error in executing command - ' + error);
							reportSubmission('RE', error.message, source_file);
							// WHAT GOES HERE?
						} else {
							console.log('Command successfully ran.');
							console.log('--stdout: ' + stdout);
							console.log('--stderr: ' + stderr);

							// TODO: Compare results here...
							var cmdToRun = testDirectory + './test "' + testfile + '" "' + outfile + '"';
							// TODO: Pickup here!
							console.log('Comparing diff with ' + cmdToRun);
							exec(cmdToRun, { timeout: 5000 }, function(error, stdout, stderr) {
								console.log('Comparing difference between ' + testfile + ' and ' + outfile);
								if (error) {
									console.log('Error in Judging: ' + error);
									// WHAT GOES HERE?
								} else {
									console.log('Test ran:');
									// console.log('Stdout: ' + stdout);
									// console.log('Stderr: ' + stderr);

									if (stderr) {
										console.log('Stderr says: ' + stderr);
										reportSubmission('TE', stderr, source_file);
									} else {
										if (stdout[0] == 'A' && stdout[1] == 'C') {
											// Correct answer! On to the next test!
											runTest(testNumber + 1);
										} else {
											// Incorrect answer! Fail the test here...
											reportSubmission('WA', stdout, source_file);
										}
									}
								}
							});
						}
					});
				} else {
					// Out of tests to run - success!
					reportSubmission('AC', '', source_file);
					cleanup(workingDirectory);
				}
			});
		}
	}

	// Report the result to the database
	// AC - correct answer
	// BE - build error
	// RE - runtime error
	// WA - wrong answer
	// TE - testing error
	function reportSubmission(result_text, additional_notes, source_file) {
		queue--;
		console.log('Reporting user submission to database...');

		console.log('Reading data from ' + source_file);
		var sourceCodeData = '';
		fs.readFile(source_file, function (err, data) {
			if (err) {
				console.log('Could not record source code for file - could not read source');
				sourceCodeData = 'Could not read - source unavailable';
			} else {
				sourceCodeData = data;
			}
			doTheRest(result_text, additional_notes, sourceCodeData);
		});

		function doTheRest(result_text, additional_notes, source_data) {
			console.log('Inserting result:');
			console.log(result_text);
			console.log(additional_notes);

			var resQuery = connection.query(
				'INSERT INTO ProblemSubmissions(user_id, problem_id, result, notes, lang_id, source_code) VALUES (?, ?, ?, ?, ?, ?);',
				[userData.user_id,
				submissionDesc.problem_id,
				result_text,
				additional_notes,
				submissionDesc.lang_id,
				source_data]);

			resQuery.on('error', function(err) {
				console.log('Error reporting submission for ' + userData.username + ' : ' + err);
				console.log('For the record, the result was: ' + result_text);
				console.log('--' + additional_notes);
			});
			resQuery.on('end', function() {
				console.log('Submission recorded successfully!');
				connection.end();
			});
		}

		callback(result_text);
	}

	// Remove the old .test files
	function cleanup(testDirectory) {
		console.log('Cleaning up problem directory...');
		console.log(testDirectory + 'cleanup');
		exec(testDirectory + 'cleanup', function(err, stdout, stderr) {
			if (err) {
				console.log('Error in cleanup: ' + err);
			} else {
				console.log('Cleanup performed successfully');
			}
		});
	}
}

exports.CreateSubmissionJudgePage = CreateSubmissionJudgePage;