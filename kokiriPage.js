// Todo: Change this closure to not be so crazy memory intensive
//  (i.e., do what the one book said to do)

// returns a kokiriPage object with a render() function
// pageDesc: object containing optional parameterss
function KokiriPage(pageDesc, errCallback) {

	var page = {},
		version = 'USU ACM Competition Framework 0.1 - Kokiri';

		if (typeof errCallback !== 'function') {
			errCallback = function() {};
		}

	// Early outs....
	if (pageDesc === null) {
		console.log('Cannot create KokiriPage - no parameters provided!');
		return null;
	}

	// Page validation...
	if (pageDesc.title === null) {
		pageDesc.title = "<Untitled>";
	}

	if (pageDesc.stylesheet === null) {
		pageDesc.stylesheet = "./style.css";
	}

	if (pageDesc.body === null) {
		if (errCallback !== null) {
			errCallback('No "body" element provided');
		} else {
			console.log('Cannot create KokiriPage - no "body" element provided');
		}
		return null;
	} else if (pageDesc.body.render === null) {
		if (errCallback !== null) {
			errCallback('Body element does not implement a render method');
		} else {
			console.log('Cannot create KokiriPage - body element does not implement "render"');
		}
		return null;
	}

	if (pageDesc.header === null){
		if (errCallback !== null) {
			errCallback('No "header" element provided');
		} else {
			console.log('Cannot create KokiriPage - no "header" element provided');
		}
		return null;
	} else if (!pageDesc.header.render) {
		if (errCallback !== null) {
			errCallback('Header element does not implement a render method');
		} else {
			console.log('Cannot create KokiriPage - header element does not implement "render"');
		}
		return null;
	}

	if (!pageDesc.sidebar) {
		if (errCallback) {
			errCallback('No "sidebar" element provided');
		} else {
			console.log('Cannot create KokiriPage - no "sidebar" element provided');
		}
		return null;
	} else if (!pageDesc.sidebar.render) {
		if (errCallback) {
			errCallback('Sidebar element does not implement a render method');
		} else {
			console.log('Cannot create KokiriPage - sidebar element does not implement "render"');
		}
		return null;
	}

	// Page creation method...
	// Callback format: content, err
	page.render = function(callback) {
		var htmlString = '',
			headString = '',
			sidebarString,
			bodyString = '';

		console.log('Rendering ' + pageDesc.title + '...');

		pageDesc.header.render(function(content, err) {
			console.log('Rendered header for ' + pageDesc.title + '...');
			if (err) {
				callback(null, err);
			} else {
				headString = content;

				pageDesc.body.render(function(content, err) {
					console.log('Rendered body for ' + pageDesc.title + '...');
					if (err) {
						callback(null, err);
					} else {
						bodyString = content;

						pageDesc.sidebar.render(function(content, err) {
							console.log('Rendered sidebar for ' + pageDesc.title + '...');
							if (err) {
								callback(null, err);
							} else {
								sidebarString = content;

								// Start doing HTML generation here...
								htmlString = '<!DOCTYPE html>';
								htmlString += '\n<html>';
								htmlString += '\n<!--PAGE GENERATOR VERSION: ' + version + '-->';
								htmlString += '\n\t<head>';
								htmlString += '\n\t\t<title>' + pageDesc.title + '</title>';
								htmlString += '\n\t\t<meta charset="utf-8">';
								htmlString += '\n\t\t<link rel="stylesheet" type="text/css" href="' + pageDesc.stylesheet + '">';
								htmlString += '\n\t</head>';
								htmlString += '\n\t<body>';
								htmlString += '\n\t<div id="container">';
								var headLines = headString.split('\n');
								for (var i = 0; i < headLines.length; i++) {
									htmlString += '\n\t' + headLines[i];
								}
								htmlString += '\n';
								htmlString += '\n\t<div id="sidebar">'
								var sidebarLines = sidebarString.split('\n');
								for (var i = 0; i < sidebarLines.length; i++) {
									htmlString += '\n\t\t' + sidebarLines[i];
								}
								htmlString += '\n\t</div>';
								htmlString += '\n\t<div id="content">';
								var bodyLines = bodyString.split('\n');
								for (var i = 0; i < bodyLines.length; i++) {
									htmlString += '\n\t\t' + bodyLines[i];
								}
								htmlString += '\n\t</div>';
								htmlString += '\n\t</div>'
								htmlString += '\n\t</body>';
								htmlString += '\n</html>';
								
								callback(htmlString);
							}
						});
					}
				});
			}
		});
	}

	return page;
}

exports.KokiriPage = KokiriPage;