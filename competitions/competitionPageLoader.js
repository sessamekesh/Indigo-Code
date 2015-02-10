var fs = require('fs');

// TODO: Make this do a callback which passes the complete data...
function CreateBodyFromFragment(competitionId) {
	console.log('Creating a body for competition blurb: ' + competitionId);

	var fragmentURI = './competitions/c' + competitionId + '/blurb.frag';
	var loadedData = '';

	if (fs.existsSync(fragmentURI)) {
		console.log('Loading fragment ' + fragmentURI);
		loadedData = fs.readFileSync(fragmentURI);
		return {
			// Callback: content, error
			render: function(callback) {
				callback(String(loadedData));
			}
		};
	} else {
		console.log('Fragment ' + fragmentURI + ' not found!');
		return {
			render: function(callback) { callback('PAGE NOT LOADED - fragment does not exist'); }
		}
	}

	return {
		render: function(callback) { callback('Deep shit - this is never suppoed to be reached! Check pageLoader.js'); }
	}
}

function CreateBodyForProblem(competitionId, problemId) {
	console.log('Creating body for problem with ID ' + problemId);

	return {
		// Callback - content, err
		render: function(callback) {
					callback('<div class="problem_description"><object data="/co?type=ProblemDescription&amp;competition_id='
						+ competitionId + '&amp;problem_id=' + problemId + '" type="application/pdf">'
						+ '\n\t<p>Whoops! Looks like your browser doesn\'t support in-line PDF viewing.'
						+ '\n\tThat\'s okay, click <a href="/co?type=ProblemDescription&amp;competition_id='
						+ competitionId + '&amp;problem_id=' + problemId + '">here</a> to download the file.</p>'
						+ '\n</object></div>\n<br />'
						+ '\n<a href="/c?s=' + problemId + '&amp;n=' + competitionId + '">Submit!</a>');
		}
	};
}

// callback: raw_data, err
function GetRawProblemStatementData(competitionId, problemId, callback) {
	console.log('Reading problem statement for problem #' + problemId);

	var pdfUri = './competitions/c' + competitionId + '/p' + problemId + '/statement.pdf';
	fs.readFile(pdfUri, function(err, data) {
		if (err){
			console.log('Error in reading file ' + pdfUri + ': ' + err);
			callback(null, 'Could not read file ' + pdfUri + ': ' + err);
		} else {
			console.log('Read in PDF data for problem!');
			callback(data);
		}
	})
}

exports.CreateBodyFromFragment = CreateBodyFromFragment;
exports.CreateBodyForProblem = CreateBodyForProblem;
exports.GetRawProblemStatementData = GetRawProblemStatementData;