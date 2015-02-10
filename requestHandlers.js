var querystring = require("querystring"),
	kokiriPage = require("./kokiriPage"),
	formidable = require("formidable"),
	user = require("./user.js"),
	kokiriUserTab = require("./kokiriUserTab.js"),
	url = require('url'),
	competitions = require('./competitions/competitions'),
	judge = require('./competitions/judge');

function index(response, request) {
	console.log('Index page requested. User requesting:');
	console.log(request.session.data.userData);

	var kokiriHeaderDesc = {
		titleText: 'USU ACM Coding Competition Framework',
		subtitleText: 'Version 0.1 (Kokiri)'
	};

	kokiriHeaderDesc.userInfo = kokiriUserTab.GenerateUserTab(request.session.data.userData);

	var kokiriPageDesc = {
		title: "Test JS Creation of Kokiri Page",
		stylesheet: "./style.css",
		header: require("./kokiriHeader").KokiriHeader(kokiriHeaderDesc),
		sidebar: require("./kokiriSidebar").GenerateSidebar(request.session.data.userData),
		body: require('./pageLoader').CreateBodyFromFragment('main')
	};

	var indexPage = kokiriPage.KokiriPage(kokiriPageDesc, function(err) {
		if (err) {
			console.log("Could not create page - " + err);
		}
	});

	console.log('Index page created.');
	console.log(indexPage);

	if (indexPage !== null && typeof indexPage.render === 'function') {
		indexPage.render(function(msg, err) {
			console.log('Rendered indexPage...');
			response.writeHead(200, {"Content-Type": "text/html"});
			if (err) {
				console.log("Could not write to indexPage - " + err);
				response.write('COULD NOT LOAD PAGE');
			} else {
				response.write(msg);
			}
			response.end();
		});
	} else {
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("Could not get index page!");
		response.end();
	}
}

function pageFromFragment(response, request, fragmentName) {
	// TODO: Fragment files may define behaviors like titleText, subtitleText
	var headerDesc = {
		titleText: 'USU ACM Competition Framework',
		subtitleText: 'Version 0.1 (Kokiri)',
		userInfo: kokiriUserTab.GenerateUserTab(request.session.data.userData)
	};

	var pageDesc = {
		title: 'Kokiri Framework',
		stylesheet: './style.css',
		header: require('./kokiriHeader').KokiriHeader(headerDesc),
		sidebar: require('./kokiriSidebar').GenerateSidebar(request.session.data.userData),
		body: require('./pageLoader').CreateBodyFromFragment(fragmentName)
	};

	var page = kokiriPage.KokiriPage(pageDesc, function(err) {
		if (err) {
			console.log('Could not create page ' + fragmentName + ' - ' + err);
		}
	});

	if (page && page.render) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		var text = page.render(function (msg, err) {
			if (err) {
				console.log('Could not write to page ' + fragmentName + ' - ' + err);
				response.write('COULD NOT LOAD PAGE');
			} else{
				response.write(msg);
			}
			response.end();
		});
	} else {
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("Could not get index page!");
		response.end();
	}
}

function complete_registration(response, request) {
	console.log('Complete registration method invoked');

	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields) {
		console.log('Fields received by registration form:');
		console.log(fields);

		user.registerUser({
			userName: fields.username,
			password: fields.password,
			name: fields.name,
			tagline: fields.tagline,
			is_admin: false,
			highest_complete: fields.highest_completed_cs
		}, function(err) {
			if (err) {
				console.log('Error on completing registration: ' + err);
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.write('Registration failed - check log');
				response.end();
			} else {
				console.log('Successful registration for ' + fields.username);
				// TODO: Create registration success page
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write('<html><body><span>Registration success! Click <a href="/">here</a> to return to site</span></body></html>');
				response.end();
			}
		});
	});
}

function login(response, request) {
	console.log("Login function invoked");
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		if (error) {
			console.log("Error: " + error);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write("Login function invoked - but it failed due to error... :(");
			response.end();
			return;
		}

		if (fields.register) {
			registrationPage(response, request);
			return;
		}

		user.getUserData(fields.username, fields.password, function(userData) {
			if (userData) {
				request.session.data.userData = userData;
				request.session.data.userData.valid = true;
				// TODO: Make this redirect not just to index, but to the page they're coming from
				response.writeHead(302, {'Location': '/index'});
				response.end();
			} else {
				request.session.data.userData = {
					username: fields.username,
					valid: false
				};
				// TODO: Make this redirect not just to index, but to the page they're coming from
				response.writeHead(302, {'Location': '/index'});
				response.end();
			}
		});
	});
}

// TODO: Move page generation logic elsewhere.
//  Give each page its own file, perhaps.
function registrationPage(response, request) {
	console.log('Register function invoked');

	if (request.session.data.userData) {
		response.writeHead(302, {'Location': '/'});
		response.end();
		return;
	}

	var kokiriHeaderDesc = {
		titleText: 'Register for ACM Coding Stuff',
		subtitleText: 'Version 0.1 (Kokiri)',
		userInfo: { render: function(cb) { cb(''); } }
	};

	var kokiriPageDesc = {
		title: 'USU ACM - Registration Form',
		stylesheet: './style.css',
		header: require("./kokiriHeader").KokiriHeader(kokiriHeaderDesc),
		sidebar: require("./kokiriSidebar").GenerateSidebar(request.session.data.userData),
		// TODO: Modify so that parameter userName is passed, the name the user entered.
		body: require("./forms/register").GenerateRegistrationForm()
	};

	var registrationPage = kokiriPage.KokiriPage(kokiriPageDesc, function(err) {
		if(err) {
			console.log("Could not create registration page - " + err);
		}
	});

	if (registrationPage && typeof registrationPage.render === 'function') {

		registrationPage.render(function (content, err) {
			if (err) {
				console.log('Error rendering registration page - ' + err);
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.write('Could not write registration page - please check log');
			} else {
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(content);
			}
			response.end();
		});
	} else {
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.write('Did not receive registration page object - please check log');
		response.end();
	}
}

function getCompetitionObject(response, request) {
	competitions.GenerateCompetitionObject(request.session.data.userData,
		querystring.parse(url.parse(request.url).query),
		// competitionObject: type, data
		//  type defines what type to be sent back.
		//  data defines the actual data to be written.
		function(competitionObject, err) {
			if (err) {
				console.log('Error in retrieving competition object - ' + err);
				response.writeHead(404);
				response.end();
			} else {
				console.log('Success in getting object of type ' + competitionObject.type);
				response.writeHead(200, {'Content-Type': competitionObject.type});
				response.write(competitionObject.data);
				response.end();
			}
		});
}

function judge_submission(response, request) {
	console.log('Submission received!!! :D :D :D');

	var subDesc, subData;
	// Get submission description

	var form = new formidable.IncomingForm();
	console.log('Parsing form...');
	form.parse(request, function(error, fields, files) {
		console.log('Apparently, parsing is finished');
		if (error) {
			console.log('Error: ' + error);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Failed to parse incoming form - ' + error);
			response.end();
			return;
		} else if (!request.session.data.userData.submitting_for) {
			console.log('Error - submitting_for variable did not reach judge_submission (requestHandlers.js)');
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Backend error - please notify developers (and check log)');
			response.end();
			return;
		}

		// Add on the selected language to the submission description...
		request.session.data.userData.submitting_for.lang_id = fields.language;

		// We have our submission data...
		judge.CreateSubmissionJudgePage(
			request.session.data.userData, // userData
			request.session.data.userData.submitting_for, // subDesc
			files.submissionfile.path, // subData
			files.submissionfile.name, // fileName
			function(page, err) { // callback
				if (err) {
					console.log('Error in starting judge process - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Could not start judge process - ' + err);
					response.end();
				} else {
					page.render(function(contents, err) {
						if (err) {
							console.log('Error in rendering judge page - ' + err);
							response.writeHead(200, {'Content-Type': 'text/plain'});
							response.write('Could not render judge process page - ' + err);
							response.end();
						} else {
							console.log('Writing rendered judge page');
							response.writeHead(200, {'Content-Type': 'text/html'});
							response.write(contents);
							response.end();
						}
					});
				}
			}
		);
	});
}

function makeCompetitionPage(response, request) {
	console.log('Request for competition page received');
	var params = {};
	var data = querystring.parse(url.parse(request.url).query);
	
	competitions.GenerateCompetitionPage(request.session.data.userData, data, function(page, err) {
		if (err) {
			console.log('Error in making competition page - ' + err);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Could not generate competition page - ' + err);
			response.end();			
		} else {
			page.render(function(contents, err) {
				if (err) {
					console.log('Error in rendering competition page - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Could not render competition page - ' + err);
					response.end();
				} else {
					console.log('Preparing to write rendered contents of competition page');
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(contents);
					response.end();
				}
			});
		}
	});
}

function getScoreboard(response, request) {
	console.log('Request for scoreboard received');
	var data = querystring.parse(url.parse(request.url).query);
	data.type = 'scores';
	competitions.GenerateCompetitionPage(request.session.data.userData, data, function(page, err) {
		if (err) {
			console.log('Error in making scoreboard page - ' + err);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Could not generate scoreboard - ' + err);
			response.end();
		} else {
			page.render(function(contents, err) {
				if (err) {
					console.log('Error in rendering scoreboard page - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Could not render scoreboard page - ' + err);
					response.end();
				} else {
					console.log('Writing rendered contents of scoreboard page to response...');
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(contents);
					response.end();
				}
			});
		}
	});
}

function getSubmissions(response, request) {
	console.log('Request for submissions page received');
	var data = querystring.parse(url.parse(request.url).query);
	data.type = 'submissions';
	competitions.GenerateCompetitionPage(request.session.data.userData, data, function(page, err) {
		if (err) {
			console.log('Error in making submissions page - ' + err);
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.write('Could not generate submissions page: ' + err);
			response.end();
		} else {
			page.render(function(contents, err) {
				if (err) {
					console.log('Error in rendering submissions page - ' + err);
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write('Could not render scoreboard page - ' + err);
					response.end();
				} else {
					console.log('Writing rendered contents of submissions page...');
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(contents);
					response.end();
				}
			});
		}
	});
}

function logout(response, request) {
	console.log("Logout function invoked!");
	request.session.data.userData = null;
	response.writeHead(302, {'Location': '/index'});
	response.end();
}

exports.index = index;
exports.login = login;
exports.logout = logout;
exports.register = complete_registration;
exports.registerNew = registrationPage;
exports.pageFromFragment = pageFromFragment;
exports.makeCompetitionPage = makeCompetitionPage;
exports.getCompetitionObject = getCompetitionObject;
exports.judge_submission = judge_submission;
exports.getScoreboard = getScoreboard;
exports.getSubmissions = getSubmissions;