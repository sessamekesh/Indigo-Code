'use strict';

var problems = require('./problems');

function GenerateSidebarFromDesc(userData, compDesc, callback) {
	var connection = require('mysql').createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	console.log('Generating sidebar from competition description:');
	console.log(compDesc);
	var compData;

	return {
		render: function(callback) {
			console.log('Rendering competition sidebar made from desc');
			var comp_query = connection.query('SELECT id, name, start_date, end_date, is_private FROM Competitions WHERE id = ? LIMIT 1;', compDesc.n);
			comp_query.on('error', function(err) {
				callback(null, err);
			});
			comp_query.on('result', function(res) {
				compData = {
					id: res.id,
					name: res.name,
					start_date: res.start_date,
					end_date: res.end_date,
					is_private: res.is_private[0],
					problems: {}
				};
			});
			comp_query.on('end', function() {
				GenerateSidebar(userData, compData, callback).render(callback);
				connection.end();
			});
		}
	}
}

// TODO: Finish
// Callback: sidebarData, err
function GenerateSidebar(userData, competitionData, callback) {

	console.log('Generating competition sidebar for');
	console.log(userData);
	console.log(competitionData);

	if (!callback) {
		callback = function(data, err) {
			console.log('Error in generating competition sidebar - ' + err);
		}
	}

	// Public access:
	// -Old public competitions
	// -About
	var toReturn = {};

	if (!userData) {
		console.log('Using no-user sidebar...');
		// No user is logged in
		// callback format: content, err
		toReturn.render = function(callback) {
			callback('<!--Not logged in competition sidebar - Kokiri 0.1 -->'
			+ '\n<ul>'
			+ '\n\t<li><a href="/">Home</a></li>'
			+ '\n\t<li><a href="/about">About</a></li>'
			+ '\n\t<li><a href="/register-new-user">Register</a></li>'
			+ '\n</ul>'
			+ '\n<hr>'
			+ '\n<b>Previous Competitions</b>'
			+ '\n<ul>'
			+ '\n\t<li>Put competitions here...</li>'
			+ '\n</ul>');
		};
		callback(toReturn);
	} else if (userData.is_admin == true) {
		// Content if admin:
		// -All competitions
		// -Current competition: all problems
		console.log('Using admin sidebar...');
		// callback format: content, err
		toReturn.render = function(callback) {
			var toReturn = '';
			toReturn +=  '<!--Admin competition sidebar - Kokiri 0.1 -->'
				+ '\n<ul>'
				+ '\n\t<li><a href="/">Home</a></li>'
				+ '\n\t<li><a href="/about">About</a></li>'
				+ '\n</ul>'
				+ '\n<hr>'
				+ '\n<b>' + competitionData.name + '</b>'
				+ '\n<ul>'
				+ '\n\t<li>Competition Rules</li>'
				+ '\n\t<li><a href="/scores?n=' + competitionData.id + '">Scores</a></li>'
				+ '\n\t<li><a href="/submissions?n=' + competitionData.id + '">Submissions</a></li>'
				+ '\n</ul>'
				+ '\n<hr>'
				+ '\n<b>Problems</b>'
				+ '\n<ul>';

			// Grab all the problems attached to this competition...
			problems.GetListOfProblems({ 'competition_id': competitionData.id }, function(res, err) {
				if (err) {
					callback(null, err);
				} else {
					for (var i = 0; i < res.length; i++) {
						toReturn += '\n\t<li><a href="/c?n=' + competitionData.id + '&amp;p=' + res[i].id + '">' + res[i].name + '</a></li>';
					}
					toReturn += '\n</ul>';
					callback(toReturn);
				}
			});
		};
	} else {
		console.log('Using peasant sidebar...');
		// Regular user is logged in
		toReturn.render = function(callback) {
			// TODO: If there IS a competition going on, show that link.
			// Also, show relevant history
			var toReturn = '<!--Logged in competition sidebar - Kokiri 0.1 -->'
				+ '\n<ul>'
				+ '\n\t<li><a href="/">Home</a></li>'
				+ '\n\t<li><a href="/about">About</a></li>'
				+ '\n</ul>'
				+ '\n<hr>'
				+ '\n<b>' + competitionData.name + '</b><br />'
				+ '\n<b>Competition Rules</b><br />'
				+ '\n<a href="/scores?n=' + competitionData.id + '">Scores</a><br />'
				+ '\n<a href="/submissions?n=' + competitionData.id + '">Submissions</a>'
				+ '\n<ul>';

			// Grab all problems associated to the competition...
			problems.GetListOfProblems({ 'competition_id': competitionData.id }, function(res, err) {
				if (err) {
					callback(null, err);
				} else {
					for (var i = 0; i < res.length; i++) {
						toReturn += '\n\t<li><a href="/c?n=' + competitionData.id + '&amp;p=' + res[i].id + '">' + res[i].name + '</a></li>';
					}
					toReturn += '\n</ul>';
					callback(toReturn);
				}
			});
		};
	}

	return toReturn;
}

exports.GenerateSidebar = GenerateSidebar;
exports.GenerateSidebarFromDesc = GenerateSidebarFromDesc;