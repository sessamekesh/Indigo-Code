'use strict';

var error_page = require('../page_builders/error_page'),
	formidable = require('formidable'),
	submission_dao = require('../dao/submission_dao'),
	language_dao = require('../dao/language_dao'),
	judge_request = require('./judge_request'),
	fs = require('fs'),
	result_listener_socket = require('../sockets/result_listener_socket'),
	scores_dao = require('../dao/scores_dao'),
	SUBMISSION_TIMEOUT_TIME = 45000,
	WAIT_BEFORE_SEND_PING_TIME = 1100,
	TIME_BETWEEN_SUBMISSIONS_SECONDS = 30;

function route(response, request, compData, problemData, remainingPath) {
	console.log('judge:: Routing request for submission from user ' + request.session.data.user.user_name + ', problem ' + problemData.name);

	if (remainingPath && remainingPath != '') {
		console.log('Error - non-empty remaining path, ' + remainingPath);
		error_page.ShowErrorPage(response, request, 'Security Error', 'A path that should not be reached has been reached. Access denied.');
	} else if (request.session.data.user === undefined
		|| request.session.data.user === 'Guest'
		|| request.session.data.user === 'IncorrectLogin') {
		console.log('Error - not logged in person tried to submit!');
		error_page.ShowErrorPage(response, request, 'Access Denied', 'You must be logged in to submit solutions to problems');
	} else if (request.session.data.user.next_submit !== undefined && request.session.data.user.next_submit > Date.now()){
		error_page.ShowErrorPage(response, request, 'Cannot accept submission', 'You must wait ' + TIME_BETWEEN_SUBMISSIONS_SECONDS + ' between making submissions. Please try again in a few seconds.');
	} else {
		request.session.data.user.next_submit = Date.now() + TIME_BETWEEN_SUBMISSIONS_SECONDS * 1000;
		judge_submission(response, request, compData, problemData);
	}
}

function judge_submission(response, request, compData, problemData) {
	console.log('judge: Preparing to judge submission...');

	var form = new formidable.IncomingForm(),
		newPath, oldPath, original_filename,
		submissionID;
	form.parse(request, function (error, fields, files) {
		if (error) {
			console.log('Error parsing form: ' + error);
			error_page.ShowErrorPage(response, request, 'Internal Error', 'An internal error occurred - try submitting again, ask admin to consult logs.');
		} else {
			oldPath = files.submission_file.path;
			original_filename = files.submission_file.name;
			
			// (1) Record submission data to SQL
			// TODO KIP: Do a 'setTimeout function'
			//  for like 30 seconds - if the status has not changed from
			//  'Q', remove it and prompt user to try again.
			submission_dao.reportSubmissionReceived(fields.language,
				problemData.id, request.session.data.team.id, new Date().valueOf() / 1000,
				function (submission_id, error) {
					if (error) {
						console.log('judge: ERR SQL Error reporting received submission: ' + error);
						error_page.ShowErrorPage(response, request, 'SQL Error', 'Error reporting submission received. Check logs!');
					} else {
						// (2) Receive submission, move files to staging area
						newPath = './data/submits/s' + submission_id;
						moveFile(oldPath, newPath, afterFileMoved);
						submissionID = submission_id;

						setTimeout(function () {
							submission_dao.checkSubmissionTimeout(submission_id,
								function() { // Timeout
									console.log('judge: Submission ' + submission_id + ' has timed out!');
									// TODO KIP: Notify socket here that submision timed out due to internal error
								},
								function (error){
									console.log('judge: Failed to check submission timeout - ' + error);
								}
							);
						}, SUBMISSION_TIMEOUT_TIME);
					}
				}
			);
		}

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
				beginJudgeProcess(submissionID, problemData, fields.language, newPath, original_filename, recordResult);
			}
		}
	});

	// (5) Record judgement result
	function recordResult(result, notes) {

		console.log('judge: Result is to be recorded here. Also, score is being updated.');
		console.log(result);
		// (6) Broadcast message via socket
		//  after two seconds - so it doesn't complete too fast.
		setTimeout(function () {
			result_listener_socket.broadcastResult(problemData.id, result.submission_id, result.result, result.notes);
		}, WAIT_BEFORE_SEND_PING_TIME);

		// (7) Update scores (if competition is ongoing)
		if (compData.start_date.getTime() < Date.now() &&
			compData.end_date.getTime() > Date.now()) {
			scores_dao.updateScore(request.session.data.team.id, compData.id, compData.incorrect_submission_time_penalty);
		} else {
			console.log('judge: Submission not scored because competition is not ongoing!');
		}
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
function beginJudgeProcess(submissionID, problemData, langID, path, originalFilename, callback) {
	console.log('judge: Beginning judge process for submission ' + submissionID);

	language_dao.getLanguageData(langID, function (result, err) {
		if (err) {
			console.log('judge: ERR SQL error retrieving language data: ' + err);
			callback('IE', 'Error retrieving language data.');
		} else {
			// We know which system to use - route to subsystem
			routeToJudgementSubsystem(result);
		}
	});

	function routeToJudgementSubsystem(languageData) {
		// Determine if a subsystem exists to achieve that goal
		//  If so, route to that subsystem.
		//  If not, give an error to the user.
		judge_request.judgeSubmission(submissionID, languageData,
			problemData, path, originalFilename, function (res, notes, err) {
				if (err) {
					callback('IE', 'judge: ERR judging submission: ' + err);
				} else {
					recordResults(res, notes);
				}
			}
		);
	}

	// Callback for test: do the callback described above.
	function recordResults(result, notes) {
		submission_dao.reportSubmissionResult(submissionID, result, notes, function (error) {
			if (error) {
				callback('IE', 'judge: ERR recording results: ' + err);
			} else {
				callback({
					submission_id: submissionID,
					result: result,
					notes: notes
				});
			}
		});
	}
}

exports.route = route;