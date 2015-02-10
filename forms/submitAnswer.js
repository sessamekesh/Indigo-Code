'use strict';

function GenerateSubmissionForm(userData, compDesc, languageList) {
	console.log('Generating submission form');
	return {
		render: function(callback) {
			console.log('Rendering submission form');
			var toReturn = '';
			toReturn += '<form action="/submit" method="post" enctype="multipart/form-data">';
			toReturn += '\n\t<h2 style="text-align: center">Submit solution</h2>';
			toReturn += '\n\t<label for="language">Language:</label>';
			toReturn += '\n\t<select name="language">';
			for (var i = 0; i < languageList.length; i++) {
				toReturn += '\n\t\t<option value="' + languageList[i].id + '">';
				toReturn += languageList[i].name + '</option>';
			}
			toReturn += '\n\t</select><br />';
			toReturn += '\n\t<label for="submissionfile">Submission File:</label>';
			toReturn += '\n\t<input type="file" name="submissionfile" multiple="multiple" /><br />';
			userData.submitting_for = { comp_id: compDesc.n, problem_id: compDesc.s };
			toReturn += '\n\t<input type="submit" value="Upload file" />';
			toReturn += '\n</form>';
			callback(toReturn);
		}
	};
}

exports.GenerateSubmissionForm = GenerateSubmissionForm;