// Owl_router.js:
//  Remember that owl from Legend of Zelda that tells you what you should do,
// but you don't listen, mash A and have to listen to it again?
// Yeah. So do we.

'use strict';

var test_case_dao = require('../dao/test_case_dao'),
	time_limit_dao = require('../dao/time_limit_dao');

var subsystems = {
	cpp98: require('./cpp98'),
	python: require('./python'),
	java1_7: require('./java1_7')
};

// Callback: result, notes, err
function judgeSubmission(submission_id, languageData, problemData, source_path, original_filename, callback) {
	console.log('owl_router: Received request to judge submission ' + submission_id + ' with language ' + languageData.name);
	console.log('Problem: ' + problemData.name + ' Language Subsystem: ' + languageData.subsys_name);
	console.log('Source Path: ' + source_path + ' Original Filename: ' + original_filename);

	if (subsystems[languageData.subsys_name]) {
		getTimeLimit(problemData, languageData.id, function (res, err) {
			if (err) {
				callback('IE', err);
			} else {
				console.log('Time limit: ' + res);
				subsystems[languageData.subsys_name].judge(submission_id, languageData, problemData, res, source_path, original_filename, callback);
			}
		});
	} else {
		callback(null, null, 'Could not find subsystem ' + languageData.subsys_name);
	}
}

function getTimeLimit(problemData, languageID, callback) {

	console.log('Fetching time limit for problem ' + problemData.name + ' with language ' + languageID);
	time_limit_dao.getTimeLimit(problemData.id, languageID, function (res, err) {
		if (err) {
			callback(null, 'Failed to get time limit: ' + err);
		} else if (res === 'USE_DEFAULT') {
			callback(problemData.time_limit);
		} else {
			callback(res);
		}
	});
}

exports.judgeSubmission = judgeSubmission;