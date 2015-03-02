var generic_page = require('./generic_page'),
	socket_router = require('../sockets/socket_router'),
	competition_dao = require('../dao/competition_dao'),
	problem_dao = require('../dao/problem_dao');

// TODO: replace.
// SQL: Store competition page link or something
//  I'd like competition pages to be generated.
//  Rules for generating comeptition pages:
// Sidebar:
// --Competition Rules
// --Competition Splash
// --Problems in Competition
// --Submission Queue*
// --Scoreboard*
// UserDesc:
// --User information
// --Placement
// --Time remaining in competition
// --Alerts*
// Body:
// --If competition splash: provided in competition (htmlfrag)
// --Problem pages will be different (though similar)

// * Use MVVM/Websockets

function GoronCompetitionPage(userData, compData, bodyData) {
	console.log('Creating a new competition page from competition data:');
	console.log(compData);

	if (!compData) {
		console.log('No competition data provided!');
		return null;
	}


	if (compData.start_date < Date.now() && compData.end_date > Date.now()) {
		console.log('competition_page: Requesting time remaining socket for' + compData.id);
		require('../sockets/time_remaining_socket').requestTimeRemainingSocket(compData);
	} else if (compData.start_date > Date.now()) {
		console.log('competition_page: Requesting time until start socket for ' + compData.id);
		require('../sockets/time_until_start_socket').requestTimeUntilStartSocket(compData);
	}

	var toReturn = {};

	toReturn.render = function(callback) {
		var htmlString = '',
			headString = '',
			sidebarString = '',
			bodyString = '',
			userInfoObject = GoronCompetitionUserInfo(userData, compData),
			required_client_includes = {},
			user_info_scripts = '',
			body_scripts = '';

		if (!userInfoObject) {
			callback(null, 'Failed to generate user info object.');
			return;
		}

		console.log('Rendering page for competition ' + compData.name + ' (ID: ' + compData.id + ')');

		renderHead();

		function renderHead() {
			console.log('Rendering header...');
			headString = '<div id="header" class="row">'
				+ '\n\t<div id="words_and_whatnot" class="col-md-10">'
				+ '\n\t\t<h1 id="title">' + compData.name + '</h1>'
				+ '\n\t\t<h2 id="subtitle">USU ACM</h2>'
				+ '\n\t</div>'
				+ '\n\t<div id="login_bit" class="col-md-2">';
			user_info_scripts = userInfoObject.generate_scripts();
			for (var required_include in user_info_scripts.required_includes) {
				required_client_includes[user_info_scripts.required_includes[required_include]] = 'Y';
			}
			userInfoObject.render(function(data, error) {
				if (error) {
					callback(null, error);
				} else {
					var lines = data.split('\n');
					for (var i = 0; i < lines.length; i++) {
						headString += '\n\t\t' + lines[i];
					}
					headString += '\n\t</div>';
					headString += '\n</div>';
					renderBody();
				}
			});
		}

		function renderBody() {
			if (!bodyData) {
				// Pretty much, just spit out HTMLFrag retrieved from database.
				competition_dao.getHTMLFrag(compData.id, function(dat, err) {
					if (err) {
						bodyString = 'ERROR in getting competition page: ' + err;
					} else {
						bodyString = '<div id="content" class="col-md-10">' + dat + '</div>';
					}
					renderSidebar();
				});
			} else {
				if (bodyData.generate_scripts) {
					body_scripts = bodyData.generate_scripts();
					for (var req_incl in body_scripts.required_includes) {
						required_client_includes[req_incl] = 'Y';
					}
				}
				// We were provided a body object, use it!
				bodyData.render(function (content, err) {
					if (err) {
						console.log('competition_page: Error generating body from provided object: ' + err);
						bodyString = 'ERROR generating body from custom object!';
					} else {
						bodyString = content;
					}
					renderSidebar();
				});
			}
			bodyString = '<div id="content" class="col-md-10">\n' + bodyString + '\n</div>';
		}

		function renderSidebar() {
			var sbo = GoronCompetitionSidebar(userData, compData);
			if (!sbo) {
				callback(null, 'Failed to generate sidebar object.');
				return;
			}

			sbo.render(function(data, error) {
				if (error) {
					callback(null, error);
				} else {
					sidebarString = data;
					compile_and_return();
				}
			});
		}

		function compile_and_return() {

			htmlString = '<!DOCTYPE html>'
				+ '\n<!-- PAGE GENERATOR VERSION: USU ACM Competition Framework 0.2 - Goron -->'
				+ '\n<html lang="en">'
				+ '\n\t<head>'
				+ '\n\t\t<title>USU ACM Competition: ' + compData.name + '</title>'
				+ '\n\t\t<meta charset="utf-8">'
				+ '\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1">'
				+ '\n\t\t<link rel="stylesheet" href="/bootstrap-3.3.2-dist/css/bootstrap.css">'
				+ '\n\t\t<link rel="stylesheet" href="/style.css">'
				+ '\n\t\t<link rel="icon" type="image/png" href="/UsuLogo.png" />'
				+ '\n\t\t<link rel="stylesheet" href="//code.jquery.com/ui/1.11.3/themes/smoothness/jquery-ui.css">'
				+ '\n\t\t<script src="/jquery-1.11.2.min.js"></script>'
				+ '\n\t\t<script src="/bootstrap-3.3.2-dist/js/bootstrap.js"></script>';

			for (var required_include in required_client_includes) {
				htmlString += '\n\t\t<script src="' + required_include + '"></script>';
			}

			htmlString += '\n\t\t<script>';
			var user_info_script_lines = user_info_scripts.script_text.split('\n');
			for (var i = 0; i < user_info_script_lines.length; i++) {
				htmlString += '\n\t\t\t' + user_info_script_lines[i];
			}
			if (body_scripts) {
				var body_script_lines = body_scripts.script_text.split('\n');
				for (var i = 0; i < body_script_lines.length; i++) {
					htmlString += '\n\t\t\t' + body_script_lines[i];
				}
			}
			htmlString += '\n\t\t</script>'
				+ '\n\t</head>'
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
				htmlString +='\n\t' + bodyLines[i];
			}
			htmlString += '\n\t</div>\n\t</div>\n\t</body>\n</html>';

			callback(htmlString);
		}
	}

	return toReturn;
}

function GoronCompetitionUserInfo(userData, compData) {
	console.log(userData);

	var toReturn = {};

	if (!userData || userData === 'Guest' || userData === 'IncorrectLogin') {

		toReturn.generate_scripts = function() {
			console.log('Generating scripts for guest...');
			if (compData.start_date < Date.now() && compData.end_date > Date.now() && compData.is_private == false) {
				// Set up a socket to show how much time is remaining.	
				return {
					required_includes: ['https://cdn.socket.io/socket.io-1.2.0.js'],
					script_text: 'var trs = io(\'/CT' + compData.id + '\');'
						+ '\n\ntrs.on(\'time_remaining\', function(tr) {'
						+ '\n\tconsole.log(\'Time remaining event fired, with param: \' + tr);'
						+ '\n\tvar ctr_f = document.getElementById(\'ctr\');'
						+ '\n\tif (tr > 24 * 60 * 60 * 1000) {'
						+ '\n\t\tctr_f.innerHTML = \'More than 24 hours\';'
						+ '\n\t} else if (tr > 0) {'
						+ '\n\t\ttr = Math.floor(tr / 1000);'
						+ '\n\t\tvar secs = tr % 60,'
						+ '\n\t\t\tmins = Math.floor((tr - secs) / 60) % 60,'
						+ '\n\t\t\thrs = Math.floor((tr - secs - (mins * 60)) / 3600) % 24,'
						+ '\n\t\t\tsecs_txt = (\'00\' + secs).slice(-2),'
						+ '\n\t\t\tmins_txt = (\'00\' + mins).slice(-2),'
						+ '\n\t\t\thrs_txt = (\'00\' + hrs).slice(-2);'
						+ '\n\t\tctr_f.innerHTML = hrs_txt + \':\' + mins_txt + \':\' + secs_txt;'
						+ '\n\t} else {'
						+ '\n\t\tctr_f.innerHTML = \'<b>Time is up!</b>\''
						+ '\n\t}'
						+ '\n}'
				};
			} else {
				return { required_includes: [], script_text: '' };
			}
		};

		toReturn.render = function(callback) {
			var user_info_code = '<form action="/user/login" method="post" role="form">'
				+ '\n\t<div class="form-group">'
				+ '\n\t\t<input type="text" class="form-control" name="username" value="Username" /><br />'
				+ '\n\t\t<input type="password" name="password" class="form-control" value="" /><br />'
				+ '\n\t\t<input type="submit" class="btn" name="login" value="Login" />'
				+ '\n\t\t<input type="submit" class="btn" id="reg_button" name="register" value="Register" />'
				+ '\n\t</div>'
				+ '\n</form>';
			if (compData.start_date < Date.now() && compData.end_date > Date.now() && compData.is_private == false) {
				// Set up a socket to show how much time is remaining.
			} else {
				// No such socket
			}
			callback(user_info_code);
		};
	} else if (userData === 'IncorrectLogin') {
		toReturn.generate_scripts = function() {
			return { required_includes: [], script_text: '' };
		}

		toReturn.render = function(callback) {
			callback('<p>Incorrect login credentials!</p>'
				+ '<form action="/user/login" method="post" role="form">'
				+ '\n\t<div class="form-group">'
				+ '\n\t\t<input type="text" class="form-control" name="username" value="Username" /><br />'
				+ '\n\t\t<input type="password" name="password" class="form-control" value="" /><br />'
				+ '\n\t\t<input type="submit" class="btn" name="login" value="Login" />'
				+ '\n\t\t<input type="submit" class="btn" id="reg_button" name="register" value="Register" />'
				+ '\n\t</div>'
				+ '\n</form>');
		}
	} else if (userData.is_admin == true) {
		toReturn.generate_scripts = function() {
			console.log('Generating scripts for admin ' + userData.user_name);
			if (compData.start_date < Date.now() && compData.end_date > Date.now()) {
				// Ongoing competition
				return {
					required_includes: ['https://cdn.socket.io/socket.io-1.2.0.js'],
					script_text: 'var trs = io(\'/CT' + compData.id + '\'),'
						+ '\n\trunning = true;'
						+ '\n\ntrs.on(\'time_remaining\', function(tr) {'
						+ '\n\tconsole.log(\'Time remaining event fired, with param: \' + tr);'
						+ '\n\tvar ctr_f = document.getElementById(\'ctr\');'
						+ '\n\tif (tr > 24 * 60 * 60 * 1000) {'
						+ '\n\t\tctr_f.innerHTML = \'More than 24 hours\';'
						+ '\n\t} else if (tr > 0) {'
						+ '\n\t\ttr = Math.floor(tr / 1000);'
						+ '\n\t\tvar secs = tr % 60,'
						+ '\n\t\t\tmins = Math.floor((tr - secs) / 60) % 60,'
						+ '\n\t\t\thrs = Math.floor((tr - secs - (mins * 60)) / 3600) % 24,'
						+ '\n\t\t\tsecs_txt = (\'00\' + secs).slice(-2),'
						+ '\n\t\t\tmins_txt = (\'00\' + mins).slice(-2),'
						+ '\n\t\t\thrs_txt = (\'00\' + hrs).slice(-2);'
						+ '\n\t\tctr_f.innerHTML = \'Time remaining: \' + hrs_txt + \':\' + mins_txt + \':\' + secs_txt;'
						+ '\n\t} else {'
						+ '\n\t\trunning=false;'
						+ '\n\t\tctr_f.innerHTML = \'<b>Time is up!</b>\';'
						+ '\n\t}'
						+ '\n});'
				};
			} else if (compData.start_date > Date.now()) {
				// Upcoming competition
				return {
					// TODO: Add 'going' field, that stops requesting time remaining after
					//  the competition has started / ended.
					required_includes: ['https://cdn.socket.io/socket.io-1.2.0.js'],
						script_text: 'var trs = io(\'/CS' + compData.id + '\'),'
						+ '\n\trunning = true;'
						+ '\n\ntrs.on(\'time_until_start\', function(tr) {'
						+ '\n\tconsole.log(\'Time until start event fired, with param: \' + tr);'
						+ '\n\tvar ctr_f = document.getElementById(\'ctr\');'
						+ '\n\tif (tr > 24 * 60 * 60 * 1000) {'
						+ '\n\t\tctr_f.innerHTML = \'More than 24 hours\';'
						+ '\n\t} else if (tr > 0) {'
						+ '\n\t\ttr = Math.floor(tr / 1000);'
						+ '\n\t\tvar secs = tr % 60,'
						+ '\n\t\t\tmins = Math.floor((tr - secs) / 60) % 60,'
						+ '\n\t\t\thrs = Math.floor((tr - secs - (mins * 60)) / 3600) % 24,'
						+ '\n\t\t\tsecs_txt = (\'00\' + secs).slice(-2),'
						+ '\n\t\t\tmins_txt = (\'00\' + mins).slice(-2),'
						+ '\n\t\t\thrs_txt = (\'00\' + hrs).slice(-2);'
						+ '\n\t\tctr_f.innerHTML = \'Time until start: \' + hrs_txt + \':\' + mins_txt + \':\' + secs_txt;'
						+ '\n\t} else {'
						+ '\n\t\tctr_f.innerHTML = \'<b>Competition has started! Refresh page to view!</b>\';'
						+ '\n\t}'
						+ '\n});'
				}
			} else {
				return { required_includes: [], script_text: '' };
			}
		}

		toReturn.render = function(callback) {
			console.log('Rendering competition user tab for admin ' + userData.user_name);
			var userInfoText = '<p>Hello, sir <b>' + userData.user_name + '</b></p>'
				+ '\n<p><i>' + userData.tagline + '</i></p>'
				+ '\n<form action="/user/logout" method="post" role="form">'
				+ '\n\t<div class="form-group">'
				+ '\n\t\t<input type="submit" class="btn btn-default" value="Logout" />'
				+ '\n\t</div>'
				+ '\n</form>\n<br />';
			if (compData.start_date > Date.now()) {
				// Display time until competition starts
				userInfoText += '\n<p id="ctr">TR</p>';
			} else if (compData.end_date > Date.now()) {
				// Display time until competition is over
				userInfoText += '\n<p id="ctr">TR</p>';
			}
			callback(userInfoText);
		}
	} else {
		toReturn.generate_scripts = function() {
			// Ongoing competition
			return {
				required_includes: ['https://cdn.socket.io/socket.io-1.2.0.js'],
				script_text: 'var trs = io(\'/CT' + compData.id + '\'),'
					+ '\n\trunning = true;'
					+ '\n\ntrs.on(\'time_remaining\', function(tr) {'
					+ '\n\tconsole.log(\'Time remaining event fired, with param: \' + tr);'
					+ '\n\tvar ctr_f = document.getElementById(\'ctr\');'
					+ '\n\tif (tr > 24 * 60 * 60 * 1000) {'
					+ '\n\t\tctr_f.innerHTML = \'More than 24 hours\';'
					+ '\n\t} else if (tr > 0) {'
					+ '\n\t\ttr = Math.floor(tr / 1000);'
					+ '\n\t\tvar secs = tr % 60,'
					+ '\n\t\t\tmins = Math.floor((tr - secs) / 60) % 60,'
					+ '\n\t\t\thrs = Math.floor((tr - secs - (mins * 60)) / 3600) % 24,'
					+ '\n\t\t\tsecs_txt = (\'00\' + secs).slice(-2),'
					+ '\n\t\t\tmins_txt = (\'00\' + mins).slice(-2),'
					+ '\n\t\t\thrs_txt = (\'00\' + hrs).slice(-2);'
					+ '\n\t\tctr_f.innerHTML = \'Time remaining: \' + hrs_txt + \':\' + mins_txt + \':\' + secs_txt;'
					+ '\n\t} else {'
					+ '\n\t\trunning=false;'
					+ '\n\t\tctr_f.innerHTML = \'<b>Time is up!</b>\';'
					+ '\n\t}'
					+ '\n});'
			};
		}

		toReturn.render = function(callback) {
			console.log('Rendering competition user tab for peasant ' + userData.user_name);
			var userInfoText = '<p>Hello, ' + userData.user_name + '</p>'
				+ '\n<p><i>' + userData.tagline + '</i></p>'
				+ '\n<form action="/user/logout" method="post" role="form">'
				+ '\n\t<div class="form-group">'
				+ '\n\t\t<input type="submit" class="btn" value="Logout" />'
				+ '\n\t</div>'
				+ '\n</form>\n<br />';
			if (compData.start_date > Date.now()) {
				// Display time until competition starts
				userInfoText += '\n<p id="ctr">TR</p>';
			} else if (compData.end_date > Date.now()) {
				// Display time until competition is over
				userInfoText += '\n<p id="ctr">TR</p>';
			}
			callback(userInfoText);
		}
	}

	return toReturn;
}

// TODO: Overhaul the sidebar completely
function GoronCompetitionSidebar(userData, compData) {
	console.log('Creating Goron competition sidebar...');
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
					+ '\n\t<b>' + compData.name + '</b>'
					+ '\n\t<ul>'
					+ '\n\t\t<li><a href="/competition/c' + compData.id + '/scoreboard"><b>Scoreboard</b></a></li>';

				// Get list of problems...
				problem_dao.getProblemsInCompetition(compData.id, function(res, err) {
					if (err) {
						console.log('Error generating sidebar: ' + err);
					} else {
						for (var i = 0; i < res.length; i++) {
							toReturn += '\n\t\t<li><a href="/competition/c' + compData.id + '/p' + res[i].id + '">'
								+ res[i].name + '</a></li>';
						}
					}
					finishRenderingSidebar_guest();
				});

				function finishRenderingSidebar_guest() {
					toReturn += '\n\t</ul><hr />';
					toReturn += '\n\t\tACM Homepage'
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
					+ '\n\t<b>' + compData.name + '</b> (<a href="/competition/c' + compData.id + '/edit">edit</a>)'
					+ '\n\t<ul>'
					+ '\n\t\t<li><a href="/competition/c' + compData.id + '/scoreboard"><b>Scoreboard</b></a></li>';

				// Get list of problems...
				problem_dao.getProblemsInCompetition(compData.id, function(res, err) {
					if (err) {
						console.log('competition_page: Error generating sidebar: ' + err);
					} else {
						for (var i = 0; i < res.length; i++) {
							toReturn += '\n\t\t<li><a href="/competition/c' + compData.id + '/p' + res[i].id + '">'
								+ res[i].name + '</a> (<a href="/competition/c' + compData.id + '/p' + res[i].id +'/edit">edit</a>)</li>';
						}
					}

					toReturn += '\n\t</ul>\n\t<hr />\n\t\tACM Homepage\n</div>';
					callback(toReturn);
				});
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
					+ '\n\t<hr>'
					+ '\n\t<b>' + compData.name + '</b>'
					+ '\n\t<ul>'
					+ '\n\t\t<li><a href="/competition/c' + compData.id + '/scoreboard"><b>Scoreboard</b></a></li>';

				// Get list of problems...
				problem_dao.getProblemsInCompetition(compData.id, function(res, err) {
					if (err) {
						console.log('competition_page: Error generating sidebar: ' + err);
					} else {
						for (var i = 0; i < res.length; i++) {
							toReturn += '\n\t\t<li><a href="/competition/c' + compData.id + '/p' + res[i].id + '">'
								+ res[i].name + '</a> (<a href="/competition/c' + compData.id + '/p' + res[i].id + '/submit">submit</a>)</li>';
						}
					}

					toReturn += '\n\t</ul>\n\t<hr />\n\t\tACM Homepage\n</div>';
					callback(toReturn);
				});
			}
		};
	}
}

exports.GoronCompetitionPage = GoronCompetitionPage;
exports.GoronCompetitionUserInfo = GoronCompetitionUserInfo;
exports.GoronCompetitionSidebar = GoronCompetitionSidebar;