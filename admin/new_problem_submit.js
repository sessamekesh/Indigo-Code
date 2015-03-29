'use strict';

var error_page = require('../page_builders/error_page'),
	querystring = require('querystring'),
	formidable = require('formidable'),
	exec =  require('child_process').exec,
	language_dao = require('../dao/language_dao'),
	problem_dao = require('../dao/problem_dao'),
	team_dao = require('../dao/team_dao'),
	test_case_dao = require('../dao/test_case_dao'),
	submission_dao = require('../dao/submission_dao'),
	generic_page = require('../page_builders/generic_page'),
	judge_request = require('../submission/judge_request'),
	fs = require('fs');

// TODO KIP: Write this
exports.route = function (response, request, remainingPath, compData) {
	if (request.method != 'POST') {
		console.log('new_competition_submit: Post data not received');
		error_page.ShowErrorPage(response, request, 'Invalid Form Submission', 'No data received from form submission!');
	} else {
		exec('mkdir ./data/sandbox/np_' + request.session.data.user.user_name, function (error, stdout, stder) {
			if (error) {
				console.log('new_competition_submit make dir ERR: ' + error);
				error_page.ShowErrorPage(response, request, 'Could not make new submission directory', error);
			} else {
				get_team_data('./data/sandbox/np_' + request.session.data.user.user_name);
			}
		});
	}

	function get_team_data(sandbox_dir) {
		team_dao.getTeamData({ userID: request.session.data.user.id, compID: compData.id }, function (res, err) {
			if (err) {
				error_page.ShowErrorPage(response, request, 'Team not found', 'This admin does not have an admin team for this competition!');
			} else {
				request.session.data.team = res;
				parse_the_form(sandbox_dir);
			}
		});
	}

	function parse_the_form(sandbox_dir) {
		var form = new formidable.IncomingForm();
		form.uploadDir = sandbox_dir;

		form.parse(request, function (err, fields, files) {
			if (err) {
				console.log('new_competition_submit: Error parsing form: ' + err);
				error_page.ShowErrorPage(response, request, 'Error parsing form', 'Could not parse incoming form: ' + err);
			} else {
				console.log('---------------------');
				console.log(fields);
				console.log('---------------------');
				console.log(files);
				create_entry(sandbox_dir, fields, files);
			}
		});
	}

	// Create database entry
	// TODO KIP: This is where hard-coded file types go... No me gusta.
	function create_entry(sandbox_dir, fields, files) {
		var ftype;
		if (files.desc_file.name.substr(-4) === '.txt') {
			ftype = { id: 2, name: '.txt.' };
		} else if (files.desc_file.name.substr(-4) === '.htm' || files.desc_file.name.substr(-5) === '.html') {
			ftype = { id: 1, name: '.htm' };
		} else if (files.desc_file.name.substr(-4) === '.pdf') {
			ftype = { id: 4, name: '.pdf' };
		} else if (files.desc_file.name.substr(-4) === '.png') {
			ftype = { id: 5, name: '.png' };
		} else {
			error_page.ShowErrorPage(response, request, 'Unknown file type', 'Do not know how to parse a ' + files.desc_file.name.substr(files.desc_file.name.lastIndexOf('.')) + 'file');
			return;
		}

		check_fname();

		function check_fname(i) {
			if (i === undefined) {
				fs.exists('./data/problem_descriptions/' + fields.prob_name + ftype.name, function (exists) {
					if (exists) {
						check_fname(0);
					} else {
						actually_enter(fields.prob_name + ftype.name)
					}
				});
			} else {
				fs.exists('./data/problem_descriptions/' + fields.prob_name + i + ftype.name, function (exists) {
					if (exists) {
						check_fname(i + 1);
					} else {
						actually_enter(fields.prob_name + '' + i + ftype.name);
					}
				});
			}
		}

		function actually_enter(actual_name) {
			var problemData = {
				prob_name: fields.prob_name,
				comp_id: compData.id,
				description_file_path: actual_name,
				description_file_type: ftype.id,
				default_time_limit: fields.time_limit
			};
			problem_dao.addNewProblem(problemData, function (rowID, error) {
				if (error) {
					console.log('new_problem_submit: Error entering problem: ' + error);
					error_page.ShowErrorPage(response, request, 'Error making database entry', error);
				} else {
					problemData.id = rowID;
					move_description_file(sandbox_dir, problemData, fields, files);
				}
			});
		}
	}

	// Move description file
	function move_description_file(sandbox_dir, problemData, fields, files) {
		exec('mv ' + files.desc_file.path + ' "./data/problem_descriptions/' + problemData.description_file_path + '"',
			function (err, stdout, stderr) {
				if (err) {
					console.log('new_problem_submit: Error moving description file: ' + err);
					error_page.ShowErrorPage(response, request, 'Error moving description file', err);
				} else {
					// Look to see what test cases there are...
					var test_cases = [];
					for (var fname in files) {
						if (fname.indexOf('tcin') >= 0) {
							test_cases.push({ input: files[fname].path, output: files['tcout' + fname.substr(4)].path, comparison_program: fields['tccp' + fname.substr(4)] });
						}
					}
					create_and_move_test_case(sandbox_dir, problemData, test_cases, 0, fields, files);
				}
			}
		);
	}

	// Create test case entries, test cases to test case directory
	function create_and_move_test_case(sandbox_dir, problemData, test_cases, i, fields, files) {
		if (i >= test_cases.length) {
			// Continue on...
			make_submission(sandbox_dir, problemData, fields, files);
		} else {
			// Register SQL....
			test_case_dao.addTestCase(problemData.id, test_cases[i].comparison_program, function (resID, err) {
				if (err) {
					console.log('new_problem_submit Error adding test case: ' + err);
					error_page.ShowErrorPage(response, request, 'Error adding test case to database', err);
				} else {
					exec('mv ' + test_cases[i].input + ' ./data/test_cases/tc' + resID + '.in', function (err, stdout, stderr) {
						if (err) {
							console.log('new_problem_submit Error moving input file: ' + err);
							error_page.ShowErrorPage(response, request, 'Error moving input file to test case', err);
						} else {
							exec('mv ' + test_cases[i].output + ' ./data/test_cases/tc' + resID + '.out', function (err, stdout, stderr) {
								if (err) {
									console.log('new_problem_submit Error moving output file: ' + err);
									error_page.ShowErrorPage(response, request, 'Error moving output file to test case', err);
								} else {
									create_and_move_test_case(sandbox_dir, problemData, test_cases, i + 1, fields, files);
								}
							});
						}
					});
				}
			});
		}
	}

	// Run submitted code against entries
	function make_submission(sandbox_dir, problemData, fields, files) {
		submission_dao.reportSubmissionReceived(fields.soln_lang,
			problemData.id, request.session.data.team.id, new Date().valueOf() / 1000,
			function (submission_id, error) {
				if (error) {
					console.log('new_problem_submit: ERR making submission: ' + error);
					error_page.ShowErrorPage(response, request, 'Error reporting submission', error);
				} else {
					// (2) Receive submission, move to staging area
					exec('mv ' + files.soln_file.path + ' ./data/submits/s' + submission_id, function (err, stdout, stderr) {
						if (err) {
							console.log('new_problem_submit: ERR moving solution file: ' + err);
							error_page.ShowErrorPage(response, request, 'Error moving submission', err);
						} else {
							// On timeout
							setTimeout(function () {
								submission_dao.checkSubmissionTimeout(submission_id,
									function () {
										console.log('new_problem_submit: Submission ' + submission_id + ' timeout!');
									}, function (error) {
										console.log('new_problem_submit: Failed to check submission timeout - ' + error);
									});
							}, 30000);

							// Begin the judgement process
							judge_process(submission_id, problemData, fields.soln_lang, './data/submits/s' + submission_id, files.soln_file.name, sandbox_dir);
						}
					});
				}
			}
		);
	}

	function judge_process(submissionID, problemData, langID, submission_path, original_filename, sandbox_dir) {
		language_dao.getLanguageData(langID, function (result, err) {
			if (err) {
				console.log('new_problem_submit ERR getting language data: ' + err);
				error_page.ShowErrorPage(response, request, 'Error getting language', 'Error getting language data for language ' + langID + ': ' + err);
			} else {
				// Route to judgement system...
				judge_request.judgeSubmission(submissionID, result, problemData, submission_path,
					original_filename, function (res, notes, err) {
						if (err) {
							console.log('new_problem_submit ERR judging submission: ' + err);
							error_page.ShowErrorPage(response, request, 'Error judging submission', err);
						} else {
							recordResults(res, notes, sandbox_dir);
						}
					}
				);
			}

			// TODO KIP: If not AC, then yeah problem. Delete shit.
			function recordResults(result, notes, sandbox_dir) {
				submission_dao.reportSubmissionResult(submissionID, result, notes, function () {});
				var page = generic_page.GoronPage({
					title: '(Goron) Submission Result Received',
					header: generic_page.GoronHeader({
						title: 'Result of Submission',
						subtitle: 'Version 0.2 (Goron)',
						user_info: generic_page.GoronUserInfo(request.session.data.user)
					}),
					sidebar: generic_page.GoronSidebar(request.session.data.user),
					body: {
						render: function (cb) {
							cb('Result of submission: ' + result + '<br />Notes: ' + notes);
						}
					}
				});

				if (page === undefined) {
					console.log('new_problem_submit Error creating page. Result was ' + result);
					error_page.ShowErrorPage(response, request, 'Internal Error', 'There was an internal error creating the submission judged page. The result was ' + result + ' and notes ' + notes + ' though.');
				} else {
					page.render(function (w, err) {
						if (err) {
							console.log('new_problem_submit: Could not render page ' + err);
							error_page.ShowErrorPage(response, request, 'Error Generating Page', 'Error generating page: ' + err + ', but the result was ' + result + ' and the notes ' + notes);
						} else {
							response.writeHead(200, {'Content-Type': 'text/html'});
							response.write(w);
							response.end();

							cleanup(sandbox_dir);
						}
					});
				}
			}
		});
	}

	// TODO KIP: Cleanup
	// -Success: Only clean up sandbox
	// -Fail: Clean up sandbox, test case, problem description,
	//			delete database submission, delete problem
	function cleanup(sandbox_dir, problemID, success) {
		console.log('new_problem_submit: Cleaning up...');

		// Do shit.
		// Clean up sandbox
		exec('rm ' + sandbox_dir + '/*', function (err, stdout, stderr) {
			if (err) {
				console.log('new_problem_submit: Error removing sandbox dir contents: ' + err);
			}
		});
		exec('rmdir ' + sandbox_dir, function (err, stdout, stderr) {
			if (err) {
				console.log('new_problem_submit: Error removing directory: ' + err);
			}
		});

		// If success,
		// Get which test cases belong to this problem
		//  Delete database entries
		//  Delete test cases

		// Get problem data
		//  Remove problem from database
		//  Remove problem description
		if (success === true) {
		} else {
		}
	}

	// If success, report success.
	// If failed, undo previous actions and report fail, along with reason.

	// // Move source file
	// function move_source_file(sandbox_dir, fields, files) {
	// 	exec('mv ' + files.soln_file.path + ' ' + sandbox_dir + '/SRC', function (err, stdout, stderr) {
	// 		if (err) {
	// 			console.log('new_problem_submit ERR: Could not rename source file: ' + err);
	// 			error_page.ShowErrorPage(response, request, 'Error packaging data', 'Could not package data - could not rename source file on host: ' + err);
	// 		} else {
	// 			rename_test_cases(sandbox_dir, fields, files);
	// 		}
	// 	});
	// }

	// // Rename test cases to expected format
	// function rename_test_cases(sandbox_dir, fields, files) {
	// 	// Gather array of test cases from the form
	// 	var test_cases = [];
	// 	for (var fname in files) {
	// 		if (fname.indexOf('tcin') >= 0) {
	// 			// Grab number after tcin, push in and out to test_cases
	// 			var tcn = fname.substr(4);
	// 			test_cases.push({ in_name: fname, out_name: 'tcout' + tcn, cpid: cpid });
	// 		}
	// 	}

	// 	// Move each test case to the appropriate spot
	// 	process_test_case(sandbox_dir, fields, files, test_cases, 0);
	// }

	// function process_test_case(sandbox_dir, fields, files, test_cases, i) {
	// 	if (i >= test_cases.length) {
	// 		// Move on.
	// 		get_language_data(sandbox_dir, fields, files, test_cases);
	// 	} else {
	// 		// Gather test data...
	// 		exec('mv ' + files[test_cases[i].in_name].path + ' ' + sandbox_dir + '/tc' + i + '.in', function (err, stdout, stderr) {
	// 			if (err) {
	// 				console.log('new_problem_submit: Could not move test case: ' + err);
	// 				error_page.ShowErrorPage(response, request, 'Error moving test case', test_cases[i].in_name + ': ' + err);
	// 			} else {
	// 				// Also make sure to copy the comparison program over
	// 				exec('cp ./data/comparison_programs/cp' + test_cases[i].cpid + ' ' + sandbox_dir + '/cp' + test_cases[i].cpid, function (err, stdout, stderr) {
	// 					if (err) {
	// 						console.log('new_problem_submit: Could not move comparison program: ' + err);
	// 						error_page.ShowErrorPage(response, request, 'Error moving comparison program ' + test_cases[i].cpid + ': ' + err);
	// 					} else {
	// 						process_test_case(sandbox_dir, fields, files, test_cases, i + 1);
	// 					}
	// 				});
	// 			}
	// 		});
	// 	}
	// }

	// function get_language_data(sandbox_dir, fields, files, test_cases) {
	// 	language_dao.getLanguageData(fields.soln_lang, function (res, err) {
	// 		if (err) {
	// 			error_page.ShowErrorPage(response, request, 'Could not get language data', 'Error: ' + err);
	// 		} else {
	// 			export_json_data(sandbox_dir, fields, files, test_cases, res);
	// 		}
	// 	});
	// }

	// function export_json_data(sandbox_dir, fields, files, test_cases, lang_data) {
	// 	var to_export = {
	// 		test_data: test_cases,
	// 		package_name: 'np_' + request.session.data.user.user_name,
	// 		submission_id: 0,
	// 		languageData: lang_data,
	// 		problemData: {
	// 			id: 0,
	// 			name: fields.prob_name,
	// 			competition_id: 0,
	// 			description_file_path: files.desc_file.path,
	// 			default_time_limit: fields.time_limit,
	// 			content_type: 0
	// 		},
	// 		time_limit: fields.time_limit,
	// 		original_filename: files.soln_file.name
	// 	};

	// 	fs.writeFile(sandbox_dir + '/submission.json', JSON.stringify(to_export), function (err) {
	// 		if (err) {
	// 			console.log('new_problem_submit Error writing SUBMISSION.JSON: ' + err);
	// 			error_page.ShowErrorPage(response, request, 'Error writing submission description file', err);
	// 		} else {

	// 		}
	// 	});
	// }

	// function create_package(sandbox_dir, package_data) {
	// 	var tarball_name = package_data.package_name + '.tar.gz';
	// 	exec('tar cvzf ' + tarball_name + ' ' + package_data.package_name + '/',
	// 		{ timeout: 5000, cwd: './data/sandbox' },
	// 		function (error, stdout, stderr) {
	// 			if (error) {
	// 				console.log('new_problem_submit: Error packaging stuff: ' + error);
	// 				error_page.ShowErrorPage(response, request, 'Error creating package', error);
	// 			} else {
	// 				send_package(package_data, sandbox_dir, tarball_name);
	// 			}
	// 		});
	// }

	// function send_package(package_data, sandbox_dir, tarball_name) {
	// 	var package_in_stream = fs.createReadStream('./data/sandbox/' + tarball_name),
	// 		json_return_string = '';

	// 	// Send out to a submission socket... Which I suppose you can create here as well.
	// 	cleanup(tarball_name, sandbox_dir);
	// }

	// function cleanup(tarball_name, sandbox_dir) {

	// }

	// function on_result_received(data) {
	// 	console.log('new_problem_submit: Data received!');
	// 	try {
	// 		var result = JSON.parse(data);
	// 		error_page.ShowErrorPage(response, request, 'Success!', 'Success! ' + data);
	// 	} catch (e) {
	// 		error_page.ShowErrorPage(response, request, 'Error on result received: ' + )
	// 	}
	// }
}