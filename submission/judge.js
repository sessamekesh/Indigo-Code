'use strict';

var error_page = require('../page_builders/error_page'),
	formidable = require('formidable'),
	submission_dao = require('../dao/submission_dao'),
	language_dao = require('../dao/language_dao');

function route(response, request, compData, problemData, remainingPath) {
	console.log('judge:: Routing request for submission from user ' + request.session.data.user.user_name + ', problem ' + problemData.name);

	if (remainingPath || remainingPath != '') {
		console.log('Error - non-empty remaining path, ' + remainingPath);
		error_page.ShowErrorPage(response, request, 'Security Error', 'A path that should not be reached has been reached. Access denied.');
	} else {
		judge_submission(response, request, compData, problemData);
	}
}

function judge_submission(response, request, compData, problemData) {
	console.log('judge: Preparing to judge submission...');

	var form = new formidable.IncomingForm(),
		newPath, oldPath, newPath, original_filename;
	form.parse(request, function (error, fields, files) {
		if (error) {
			console.log('Error parsing form: ' + error);
			error_page.ShowErrorPage(response, request, 'Internal Error', 'An internal error occurred - try submitting again, ask admin to consult logs.');
		} else {
			oldPath = files.submission_file.path;
			original_filename = files.submission_file.name;
			
			// (1) Record submission data to SQL
			submission_dao.reportSubmissionReceived(fields.language,
				problemData.id, request.session.data.user.id, Date.now(),
				function (submission_id, error) {
					if (error) {
						console.log('judge: ERR SQL Error reporting received submission: ' + error);
						error_page.ShowErrorPage(response, request, 'SQL Error', 'Error reporting submission received. Check logs!');
					} else {
						// (2) Receive submission, move files to staging area
						moveFile(oldPath, './submits/s' + submission_id, afterFileMoved);
					}
				}
			);
		}
	});

	// (3) Show submission page to user, setup socket
	function afterFileMoved(error) {
		if (error) {
			console.log('Error moving file: ' + error);
			error_page.ShowErrorPage(response, request, 'Internal Error', 'Unable to move submission to judge environment. Check logs.');
		} else {
			// (3) Show submission page to user (RESPONSE)
			//  (a) Setup socket (server-side)
			response.writeHead(303, {'Location': '/competition/c' + compData.id + '/p' + problemData.id + '/submissions'});
			response.end();

			// (4) Begin judge process
			beginJudgeProcess(submission_id, problemData.id, fields.language, newPath, original_filename, recordResult);
		}
	}

	// (5) Record judgement result
	function recordResult(resultData, error) {
		// (6) Broadcast message via socket
	}
}

// Callback: err (null if success)
function moveFile(oldPath, newPath, callback) {
	console.log('judge: Moving submission from ' + oldPath + ' to ' + newPath);
	fs.rename(oldPath, newPath, function (err) {
		if (err) {
			fs.unlink(newPath);
			fs.rename(oldPath, newPath, function (aerr) {
				if (aerr) {
					console.log('judge: Unable to move submission: ' + aerr);
					callback(aerr);
				} else {
					callback();
				}
			});
		} else {
			callback();
		}
	});
}

// Callback:
//  - result: { result: 'AC'/'TLE'/'WA'..., source_code: ... notes: ... }
//  - error: some error description
function beginJudgeProcess(submissionID, problemID, langID, path, originalFilename, callback) {
	console.log('judge: Beginning judge process for submission ' + submissionID);

	language_dao.getLanguageData(langID, function (result, err) {
		if (err) {
			console.log('judge: ERR SQL error retrieving language data: ' + err);
			callback(null, 'Error retrieving language data.');
		} else {
			// We know which system to use - get problem data
			getProblemData();
		}
	});

	function getProblemData() {
		console.log('judge: retrieving problem data for ' + problemID);
		// TODO KIP: Resume here.
	}

	// Determine if a subsystem exists to achieve that goal
	//  If so, route to that subsystem.
	//  If not, give an error to the user.

	// Callback for test: do the callback described above.
}

/*
function judge_submission(response, request) {
	console.log('Submission received!!! :D :D :D');

	var subDesc, subData;
	// Get submission description

	var form = new formidable.IncomingForm();
	console.log('Parsing form...');
	form.parse(request, function(error, fields, files) {
		console.log('Apparently, parsing is finished');
		if (error) {
			console.log('Error: ' + error);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Failed to parse incoming form - ' + error);
			response.end();
			return;
		} else if (!request.session.data.userData.submitting_for) {
			console.log('Error - submitting_for variable did not reach judge_submission (requestHandlers.js)');
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Backend error - please notify developers (and check log)');
			response.end();
			return;
		}

		// Add on the selected language to the submission description...
		request.session.data.userData.submitting_for.lang_id = fields.language;

		// We have our submission data...
		judge.CreateSubmissionJudgePage(
			request.session.data.userData, // userData
			request.session.data.userData.submitting_for, // subDesc
			files.submissionfile.path, // subData
			files.submissionfile.name, // fileName
			function(page, err) { // callback
				if (err) {
					console.log('Error in starting judge process - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Could not start judge process - ' + err);
					response.end();
				} else {
					page.render(function(contents, err) {
						if (err) {
							console.log('Error in rendering judge page - ' + err);
							response.writeHead(200, {'Content-Type': 'text/plain'});
							response.write('Could not render judge process page - ' + err);
							response.end();
						} else {
							console.log('Writing rendered judge page');
							response.writeHead(200, {'Content-Type': 'text/html'});
							response.write(contents);
							response.end();
						}
					});
				}
			}
		);
	});
}
*/

exports.route = route;