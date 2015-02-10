// Todo: Change this closure to not be so crazy memory intensive
//  (i.e., do what the one book said to do)

// returns an object with a render() function - for use as a header
function KokiriHeader(headerDesc, errCallback) {
	var page = {},
		version = 'USU ACM Competition Header Version - 0.1 (Kokiri)';

	// If no error callback is set, set it to an empty anonymous function
	//  This is so we don't have to null check every time.
	if (typeof errCallback !== 'function') {
		errCallback = function() {};
	}

	if (headerDesc.titleText === undefined) {
		headerDesc.titleText = '<Untitled>';
	}

	if (headerDesc.subtitleText === undefined) {
		headerDesc.subtitleText = '';
	}

	// callback format: string, err
	page.render = function(callback) {
		console.log('Rendering header...');

		var headText = '<div id="header">';
		headText += '\n\t<div id="words_and_whatnot">';
		headText += '\n\t\t<h1 id="title">' + headerDesc.titleText + '</h1>';
		headText += '\n\t\t<h2 id="subtitle">' + headerDesc.subtitleText + '</h2>';
		headText += '\n\t</div>';
		headText += '\n\t<div id="login_bit">';

		if (!headerDesc.userInfo) {
			callback(null, 'Could not find userInfo property of headerDesc');
		} else {
			// Output user data...
			headerDesc.userInfo.render(function(result, err) {
				console.log('Rendered user info, putting into header.');
				if (err) {
					callback(result, err);
				} else {
					var headLines = result.split('\n');
					for (var i = 0; i < headLines.length; i++) {
						headText += '\n\t\t' + headLines[i];
					}
					headText += '\n\t</div>';
					headText += '\n</div>';
					callback(headText);
				}
			});
		}
	}

	return page;
}

exports.KokiriHeader = KokiriHeader;