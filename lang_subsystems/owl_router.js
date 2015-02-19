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
function judgeSubmission(submission_id, lang_system, problemData, source_path, original_filename, callback) {
	console.log('owl_router: Received request to judge submission ' + submission_id + ' with language ' + lang_system + ', pertaining to problem ' + problemData.name);

	if (subsystems[lang_system]) {
		subsystems[lang_system].judge(submission_id, problemData, source_path, original_filename, callback);
	} else {
		callback(null, null, 'Could not find subsystem ' + lang_system);
	}
}

exports.judgeSubmission = judgeSubmission;