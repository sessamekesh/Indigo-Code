var competition_dao = require('../dao/competition_dao'),
	fs = require('fs'),
	UPCOMING_TIME_WINDOW = 60 * 60 * 0.5; // 1/2 hour

// NEXT VERSION: Don't do it this way. Just... don't.

// Returns a GoronPage with a render() function
function GoronPage(pageDesc) {
	console.log('Creating new page for display...');

	var page = {},
		version = 'USU ACM Competition Framework 0.2 - Goron',
		script_dependencies = [],
		script_text;

	if (!pageDesc) {
		console.log('Cannot create page - no description provided!');
		return null;
	}

	// Make sure we have the required elements...
	if (!pageDesc.title) {
		pageDesc.title = '<Untitled>';
	}

	if (!pageDesc.stylesheet) {
		pageDesc.stylesheet = '/style.css';
	}

	if (!pageDesc.body || !pageDesc.body.render) {
		console.log('No "body" element provided!');
		pageDesc.body = { render: function(cb) { cb('NO BODY PROVIDED'); }};
	}

	if (!pageDesc.header || !pageDesc.header.render) {
		console.log('No "header" element provided!');
		pageDesc.header = { render: function(cb) { cb('NO HEADER PROVIDED'); }};
	}

	if (!pageDesc.sidebar || !pageDesc.sidebar.render) {
		console.log('No "sidebar" element provided!');
		pageDesc.sidebar = { render: function(cb) { cb('NO SIDEBAR PROVIDED'); }};
	}

	// Page creation method...
	page.render = function(callback) {
		var htmlString = '',
			headString = '',
			sidebarString = '',
			bodyString = '';

		console.log('Rendering page ' + pageDesc.title + '...');

		renderHead();

		function renderHead() {
			if (pageDesc.header.gen_dependencies !== undefined) {
				pageDesc.header.gen_dependencies(function (dependencies, err) {
					if (!err) {
						for (var i = 0; i < dependencies.length; i++) {
							script_dependencies.push(dependencies[i]);
						}
					} else {
						console.log('generic_page: Error generating dependencies for head: ' + err);
					}
					check_scripts();
				});
			} else {
				check_scripts();
			}

			function check_scripts() {
				if (pageDesc.header.gen_scripts !== undefined) {
					pageDesc.header.gen_scripts(function (scriptText, err) {
						if (err) {
							console.log('generic_page: Error generating scripts for head: ' + err);
						} else {
							if (script_text === undefined) {
								script_text = scriptText;
							} else {
								script_text += scriptText;
							}
						}
						finish();
					});
				} else {
					finish();
				}
			}

			function finish() {
				pageDesc.header.render(function(content, err) {
					if (err) {
						console.log('generic_page: ERR rendering header: ' + err);
						callback(null, err);
					} else {
						headString = content;
						renderBody();
					}
				});
			}
		}

		function renderBody() {
			if (pageDesc.body.gen_dependencies !== undefined) {
				pageDesc.body.gen_dependencies(function (dependencies, err) {
					if (!err) {
						for (var i = 0; i < dependencies.length; i++) {
							script_dependencies.push(dependencies[i]);
						}
					} else {
						console.log('generic_page: Error generating dependencies for head: ' + err);
					}
					check_scripts();
				});
			} else {
				check_scripts();
			}

			function check_scripts() {
				if (pageDesc.body.gen_scripts !== undefined) {
					pageDesc.body.gen_scripts(function (scriptText, err) {
						if (err) {
							console.log('generic_page: Error generating scripts for head: ' + err);
						} else {
							if (script_text === undefined) {
								script_text = scriptText;
							} else {
								script_text += scriptText;
							}
						}
						finish();
					});
				} else {
					finish();
				}
			}

			function finish() {
				pageDesc.body.render(function(content, err) {
					console.log('Rendering body for ' + pageDesc.title + '...');
					if (err) {
						callback(null, err);
					} else {
						bodyString = content;
						renderSidebar();
					}
				});
			}
		}

		function renderSidebar() {
			if (pageDesc.sidebar.gen_dependencies !== undefined) {
				pageDesc.sidebar.gen_dependencies(function (dependencies, err) {
					if (!err) {
						for (var i = 0; i < dependencies.length; i++) {
							script_dependencies.push(dependencies[i]);
						}
					} else {
						console.log('generic_page: Error generating dependencies for head: ' + err);
					}
					check_scripts();
				});
			} else {
				check_scripts();
			}

			function check_scripts() {
				if (pageDesc.sidebar.gen_scripts !== undefined) {
					pageDesc.sidebar.gen_scripts(function (scriptText, err) {
						if (err) {
							console.log('generic_page: Error generating scripts for head: ' + err);
						} else {
							if (script_text === undefined) {
								script_text = scriptText;
							} else {
								script_text += scriptText;
							}
						}
						finish();
					});
				} else {
					finish();
				}
			}

			function finish() {
				pageDesc.sidebar.render(function(content, err) {
					console.log('Rendering sidebar for ' + pageDesc.title + '...');
					if (err) {
						callback(null, err);
					} else {
						sidebarString = content;
						compile();
					}
				});
			}
		}

		function compile() {
			htmlString = '<!DOCTYPE html>'
				+ '\n<!-- PAGE GENERATOR VERSION: ' + version + ' -->'
				+ '\n<html lang="en">'
				+ '\n\t<head>'
				+ '\n\t\t<title>' + pageDesc.title + '</title>'
				+ '\n\t\t<meta charset="utf-8">'
				+ '\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1">'
				+ '\n\t\t<link rel="stylesheet" href="/bootstrap-3.3.2-dist/css/bootstrap.css">'
				+ '\n\t\t<link rel="stylesheet" href="/style.css">'
				+ '\n\t\t<script src="/jquery-1.11.2.min.js"></script>'
				+ '\n\t\t<script src="/bootstrap-3.3.2-dist/js/bootstrap.js"></script>';

			for (var i = 0; i < script_dependencies.length; i++) {
				htmlString += '\n\t\t<script src="' + script_dependencies[i] + '"></script>';
			}

			if (script_text !== undefined) {
				var script_text_lines = script_text.split('\n');
				htmlString += '\n\t\t<script>';
				for (var i = 0; i < script_text_lines.length; i++) {
					htmlString += '\n\t\t\t' + script_text_lines[i];
				}
				htmlString += '\n\t\t</script>';
			}

			htmlString += '\n\t</head>'
				+ '\n\t<body>'
				+ '\n\t<div id="container" class="container-fluid">';
			var headLines = headString.split('\n');
			for (var i = 0; i < headLines.length; i++) {
				htmlString += '\n\t' + headLines[i];
			}
			htmlString += '\n\t<div class="row">';
			var sidebarLines = sidebarString.split('\n');
			for (var i = 0; i < sidebarLines.length; i++) {
				htmlString += '\n\t' + sidebarLines[i];
			}
			var bodyLines = bodyString.split('\n');
			for (var i = 0; i < bodyLines.length; i++) {
				htmlString += '\n\t' + bodyLines[i];
			}
			htmlString += '\n\t</div>';
			htmlString += '\n\t</div>';
			htmlString += '\n\t</body>';
			htmlString += '\n</html>';

			callback(htmlString);
		}
	}

	return page;
}

function GoronUserInfo(userData) {
	console.log('Creating Goron user info tab...');
	return {
		// NEXT VERSION: Do not let userData be anything BUT complete userData
		//  i.e., no more of this 'Guest' and 'IncorrectLogin'
		//  Reserve separate things for that.
		// It is NOT scalable.
		render: function(callback) {
			if (!userData || userData === 'Guest' || userData === 'IncorrectLogin') {
				console.log('Rendering Goron user tab for a guest');
				callback('<form action="/user/login" method="post" role="form">'
					+ '\n\t<div class="form-group">'
					+ '\n\t\t<input type="text" class="form-control" name="username" value="Username" /><br />'
					+ '\n\t\t<input type="password" class="form-control" name="password" value="" /><br />'
					+ '\n\t\t<input type="submit" class="btn pull-left" name="login" value="Login" />'
					+ '\n\t\t<input type="submit" class="btn pull-right" id="reg_button" name="register" value="Register" />'
					+ '\n\t</div>'
					+ '\n</form>');
			} else if (userData === 'IncorrectLogin') {
				console.log('Rendering Goron user tab for an incorrect login');
				callback('<p>Incorrect login credentials!</p>'
					+ '\n<form action="/user/login" method="post" role="form">'
					+ '\n\t<div class="form-group">'
					+ '\n\t\t<input type="text" class="form-control" name="username" value="Username" /><br />'
					+ '\n\t\t<input type="password" class="form-control" name="password" value="" /><br />'
					+ '\n\t\t<input type="submit" class="btn pull-left" name="login" value="Login" />'
					+ '\n\t\t<input type="submit" class="btn pull-right" name="register" value="Register" />'
					+ '\n\t</div>'
					+ '\n</form>');
			} else if (userData.is_admin == true) {
				console.log('Rendering Goron user tab for an admin');
				callback('<p>Hello, sir <b>' + userData.user_name + '</b></p>'
					+ '\n<p><i>' + userData.tagline + '</i></p>'
					+ '\n<form action="/user/logout" method="post" role="form">'
					+ '\n\t<div class="form-group">'
					+ '\n\t\t<input type="submit" class="btn" value="Logout" />'
					+ '\n\t</div>'
					+ '\n</form>');
			} else {
				console.log('Rendering Goron user tab for a peasant');
				callback('<p>Hello, <b>' + userData.user_name + '</b></p>'
					+ '\n<p><i>' + userData.tagline + '</i></p>'
					+ '\n<form action="/user/logout" method="post" role="form">'
					+ '\n\t<div class="form-group">'
					+ '\n\t\t<input type="submit" class="btn btn-default" value="Logout" />'
					+ '\n\t</div>'
					+ '\n</form>');
			}
		}
	}
}

function GoronHeader(headerDesc) {
	console.log('Creating Goron header...');

	if (!headerDesc) {
		console.log('Cannot create page - no description provided!');
		return null;
	}

	if (!headerDesc.title) {
		headerDesc.title = '&gt;Untitled&lt;';
	}

	 if (!headerDesc.subtitle) {
	 	headerDesc.subtitle = '';
	 }

	 if (!headerDesc.user_info) {
	 	headerDesc.user_info = GoronUserInfo();
	 }

	 return {
	 	render: function(callback) {
	 		console.log('Rendering header...');
	 		var headText = '<div id="header" class="row">'
	 			+ '\n\t<div id="words_and_whatnot" class="col-md-10">'
	 			+ '\n\t\t<h1 id="title" class="text-center">' + headerDesc.title + '</h1>'
	 			+ '\n\t\t<h2 id="subtitle" class="text-center">' + headerDesc.subtitle + '</h2>'
	 			+ '\n\t</div>'
	 			+ '\n\t<div id="login_bit" class="col-md-2">';
	 		headerDesc.user_info.render(function(dat, err) {
	 			if (err) {
	 				callback(null, err);
	 			} else {
	 				var lines = dat.split('\n');
	 				for (var i = 0; i < lines.length; i++) {
	 					headText += '\n\t\t' + lines[i];
	 				}
	 				headText += '\n\t</div>';
	 				headText += '\n</div>';
	 				callback(headText);
	 			}
	 		});
	 	}
	 }
}

function GoronBody(content) {
	return {
		render: function(callback) {
			callback('<div id="content" class="col-md-10">\n\t' + content + '\n</div>');
		}
	};
}

function GoronBodyFromFragment(fragmentName) {
	return {
		render: function (callback) {
			var tr = '<div id="content" class="col-md-10">\n\t';

			fs.readFile('./data/frags/' + fragmentName + '.html', function (err, data) {
				if (err) {
					console.log('generic_page: Error reading fragment ' + fragmentName + ': ' + err);
					callback(tr + 'Unknown error loading page!\n\t</div>');
				} else {
					callback(tr + data + '\n\t</div>');
				}
			});
		}
	}
}

function GoronSidebar(userData) {
	console.log('Creating Goron sidebar...');
	if(!userData || userData === 'Guest' || userData === 'IncorrectLogin') {
		// Guest Sidebar
		return {
			render: function(callback) {
				console.log('Rendering Goron sidebar for guest');
				var toReturn = '<div id="sidebar" class="col-md-2">';
				toReturn += '\n\t<ul>'
					+ '\n\t\t<li><a href="/index">Home</a></li>'
					+ '\n\t\t<li><a href="/index/about">About</a></li>'
					+ '\n\t\t<li><a href="#" onclick="document.getElementById(\'reg_button\').click();">Register</a></li>'
					+ '\n\t</ul>'
					+ '\n\t<hr>'
					+ '\n\t<b>Previous Public Competitions</b><br />'
					+ '\n\t<ul>';

				competition_dao.getPreviousCompetitions(function (res, err) {
					if (err) {
						console.log('Error getting previous competitions for guest: ' + err);
					} else {
						for (var i = 0; i < res.length; i++) {
							if (res[i].is_private[0] == false) {
								toReturn += '\n\t\t<li><a href="/competition/c'
									+ res[i].id + '">' + res[i].name + '</a></li>';
							}
						}
					}
					genGuestSidebarLast();
				});

				function genGuestSidebarLast() {
					toReturn += '\n\t</ul>'
						+ '\n\t<hr>'
						+ '\n\t<ul>'
						+ '\n\t\t<li>ACM Homepage</li>'
						+ '\n\t</ul>'
						+ '\n</div>';
					callback(toReturn);
				}
			}
		};
	} else if (userData.is_admin == true ){
		// Admin sidebar
		return {
			render: function(callback) {
				console.log('Rendering Goron sidebar for admin ' + userData.user_name);
				var toReturn = '<div id="sidebar" class="col-md-2">';
				toReturn += '\n\t<ul>'
					+ '\n\t\t<li><a href="/index">Home</a></li>'
					+ '\n\t\t<li><a href="/index/about">About</a></li>'
					+ '\n\t</ul>'
					+ '\n\t<hr>'
					+ '\n\t<b>Upcoming Competitions</b><br />'
					+ '\n\t<ul>';

				// Here: insert all competitions...
				competition_dao.getUpcomingCompetitions(0, function(res, err) {
					if (err) {
						console.log('Error generating upcoming competitions: ' + err);
					} else {
						for (var i = 0; i < res.length; i++) {
							toReturn += '\n\t\t<li>'
								+ '<a href="/competition/c' + res[i].id + '">' + res[i].name + '</a></li>';
						}
					}
					doTheNextBit();
				});

				function doTheNextBit() {
					toReturn += '\n\t</ul>'
						+ '\n\t<hr>'
						+ '\n\t<b>Current Competitions</b>'
						+ '\n\t<ul>';

					competition_dao.getOngoingCompetitions(function(res, err) {
						if (err) {
							console.log('Error generating ongoing competitions: ' + err);
						} else {
							for (var i = 0; i < res.length; i++) {
								toReturn += '\n\t\t<li>'
									+ '<a href="/competition/c' + res[i].id + '">' + res[i].name + '</a></li>';
							}
						}
						andTheBitAfterThat();
					});
				}

				function andTheBitAfterThat() {
					toReturn += '\n\t</ul>'
						+ '\n\t<hr>'
						+ '\n\t<b>Previous Competitions</b><br />'
						+ '\n\t<ul>';

					competition_dao.getPreviousCompetitions(function(res, err) {
						if (err) {
							console.log('Error generating previous competitions: ' + err);
						} else {
							for (var i = 0; i < res.length; i++) {
								toReturn += '\n\t\t<li>'
									+ '<a href="/competition/c' + res[i].id + '">' + res[i].name + '</a></li>';
							}
						}
						finishIt();
					});
				}

				function finishIt() {
					toReturn += '\n\t</ul>'
						+ '\n\t<hr>'
						+ '\n\t<ul>'
						+ '\n\t\t<li>ACM Homepage</li>'
						+ '\n\t</ul>'
						+ '\n</div>';
					callback(toReturn);
				}
			}
		};
	} else {
		// Peasant Sidebar
		return {
			render: function(callback) {
				console.log('Rendering Goron sidebar for peasant ' + userData.user_name);
				var toReturn = '<div id="sidebar" class="col-md-2">';
				toReturn += '\n\t<ul>'
					+ '\n\t\t<li><a href="/index">Home</a></li>'
					+ '\n\t\t<li><a href="/index/about">About</a></li>'
					+ '\n\t</ul>'
					+ '\n\t<hr>';

				competition_dao.getUpcomingCompetitions(UPCOMING_TIME_WINDOW, function (res, err) {
					if (err) {
						console.log('generic_page: ERR getting upcoming competitions for peasant: ' + err);
					} else {
						console.log('DEBUG REMOVE: Getting upcoming: ');
						console.log(res);
						if (res.length > 0) {
							toReturn += '\n\t<b>Upcoming Competitions</b>'
								+ '\n\t<ul>';
							for (var i = 0; i < res.length; i++) {
								toReturn += '\n\t\t<li><a href="/competition/c' + res[i].id + '">' + res[i].name + '</a></li>';
							}
							toReturn += '\n\t</ul>';
						}
					}
					afterUpcomingCompetitions();
				});

				function afterUpcomingCompetitions() {
					toReturn += '\n\t<b>Current Competitions</b>'
						+ '\n\t<ul>';
					competition_dao.getOngoingCompetitions(function (res, err) {
						if (err) {
							console.log('Error getting ongoing competitions for peasant: ' + err);
						} else {
							for (var i = 0; i < res.length; i++) {
								toReturn += '\n\t\t<li><a href="/competition/c' + res[i].id + '">' + res[i].name + '</a></li>';
							}
						}
						afterCurrentCompetitions();
					});
				}

				function afterCurrentCompetitions() {
					toReturn += '\n\t</ul>'
						+ '\n\t<hr>'
						+ '\n\t<b>Previous Competitions</b><br />'
						+ '\n\t<ul>';
					competition_dao.getPreviousCompetitions(function (res, err) {
						if (err) {
							console.log('Error getting previous competitions for peasant: ' + err);
						} else {
							for (var i = 0; i < res.length; i++) {
								toReturn += '\n\t\t<li><a href="/competition/c' + res[i].id + '">' + res[i].name + '</a></li>';
							}
						}
						afterPreviousCompetitions();
					});
				}

				function afterPreviousCompetitions() {
					toReturn += '\n\t</ul>'
						+ '\n\t<hr>'
						+ '\n\t<ul>'
						+ '\n\t\t<li>ACM Homepage</li>'
						+ '\n\t</ul>'
						+ '\n</div>';
					callback(toReturn);
				}
			}
		};
	}
}

exports.GoronPage = GoronPage;
exports.GoronSidebar = GoronSidebar;
exports.GoronUserInfo = GoronUserInfo;
exports.GoronHeader = GoronHeader;
exports.GoronBody = GoronBody;
exports.GoronBodyFromFragment = GoronBodyFromFragment;