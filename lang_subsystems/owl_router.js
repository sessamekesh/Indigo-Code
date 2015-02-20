// Owl_router.js:
//  Remember that owl from Legend of Zelda that tells you what you should do,
// but you don't listen, mash A and have to listen to it again?
// Yeah. So do we.

'use strict';

var cpp98 = require('./cpp98'),
	python = require('./python');

var subsystems = {
	cpp98: cpp98,
	python: python
};

// Callback: result, notes, err
function judgeSubmission(submission_id, languageData, problemData, source_path, original_filename, callback) {
	console.log('owl_router: Received request to judge submission ' + submission_id + ' with language ' + languageData.name);
	console.log('Problem: ' + problemData.name + ' Language Subsystem: ' + languageData.subsys_name);
	console.log('Source Path: ' + source_path + ' Original Filename: ' + original_filename);

	if (subsystems[languageData.subsys_name]) {
		subsystems[languageData.subsys_name].judge(submission_id, languageData, problemData, source_path, original_filename, callback);
	} else {
		callback(null, null, 'Could not find subsystem ' + languageData.subsys_name);
	}
}

exports.judgeSubmission = judgeSubmission;