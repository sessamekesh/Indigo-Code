// Owl_router.js:
//  Remember that owl from Legend of Zelda that tells you what you should do,
// but you don't listen, mash A and have to listen to it again?
// Yeah. So do we.

'use strict';

var subsystems = {
	cpp98: require('./cpp98'),
	python: require('./python'),
	java1_7: require('./java1_7'),
	java1_8: require('./java1_8'),
	c: require('./c'),
	nodejs: require('./nodejs'),
	cpp11: require('./cpp11'),
	golang: require('./golang'),
	vigil: require('./vigil'),
	cpp14: require('./cpp14')
};

// Callback: result, notes, err
function judgeSubmission(submission_id, languageData, problemData, source_path, original_filename, time_limit, test_cases, callback) {
	console.log('owl_router: Received request to judge submission ' + submission_id + ' with language ' + languageData.name);
	console.log('Problem: ' + problemData.name + ' Language Subsystem: ' + languageData.subsys_name);
	console.log('Source Path: ' + source_path + ' Original Filename: ' + original_filename);

	if (subsystems[languageData.subsys_name]) {
		subsystems[languageData.subsys_name].judge(submission_id, languageData, problemData, time_limit, source_path, original_filename, test_cases, callback);
	} else {
		callback(null, null, 'Could not find subsystem ' + languageData.subsys_name);
	}
}

exports.judgeSubmission = judgeSubmission;