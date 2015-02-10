'use strict';

var competitions = require('./competitions/competitions')

// Callback: sidebarData, err
function GenerateSidebar(userData, callback) {
	// Public access:
	// -Old public competitions
	// -About
	var toReturn = {};

	if (!userData || (!userData.valid)) {
		// No user is logged in
		// callback format: content, err
		toReturn.render = function(callback) {
			callback('<!--Visitor sidebar - Kokiri 0.1 -->'
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
	} else if (userData.is_admin == true) {
		// Admin is logged in
		// On general page:
		//  -Competitions
		//  --View All
		//  --Create New
		//  --(next 5 - list as) Modify (CompName)
		//  -Manage Users

		// On competition page, add to top:
		//  -(CompName)
		//  --Add Problem
		//  --Edit (ProblemName)
		//  --Edit (ProblemName)

		// callback format: content, err
		toReturn.render = function(callback) {
			var toReturn = '';
			toReturn +=  '<!--Admin sidebar - Kokiri 0.1 -->'
			+ '\n<ul>'
			+ '\n\t<li><a href="/">Home</a></li>'
			+ '\n\t<li><a href="/about">About</a></li>'
			+ '\n</ul>'
			+ '\n<hr>'
			+ '\n<b>Admin Functions</b>'
			+ '\n<ul>'
			+ '\n\t<li><b>Manage Competitions</b>'
			+ '\n\t<ul>'
			+ '\n\t\t<li>View All</li>'
			+ '\n\t\t<li>Create New</li>';

			// TODO: If there are upcoming competitions, list them here.
			// \n\t\t<li>Competition Name</li>
			competitions.GetListOfCompetitions({ 'get_future': true }, function(comps, err) {
				if (err) {
					callback(null, err);
				} else {
					for (var i = 0; i < comps.length; i++) {
						toReturn += '\n\t\t<li><a href="c?n=' + comps[i].id + '">' + comps[i].name + '</a></li>';
					}
					toReturn += '\n\t</ul></li>'
						+ '\n\t<li>Manage Users</li>'
						+ '\n\t<li>Add Admin Functions Here...</li>'
						+ '\n\t<li>Add Admin Functions Here...</li>'
						+ '\n</ul>'
						+ '\n<hr>'
						+ '\n<b>Upcoming/Current Competitions</b>'
						+ '\n<ul>'
						+ '\n\t<li>List competitions here...</li>'
						+ '\n</ul>'
						+ '\n<hr>'
						+ '\n<b>Previous Competitions</b>'
						+ '\n<ul>';

					competitions.GetListOfCompetitions({ 'get_current': false, 'get_previous': true, 'get_future': false }, function(comps, err) {
						if (err) {
							callback(null, err);
						} else {
							for (var i = 0; i < comps.length; i++) {
								toReturn += '\n\t<li><a href="c?n=' + comps[i].id + '">' + comps[i].name + '</a></li>';
							}
							toReturn += '\n</ul>';
							callback(toReturn);
						}
					});
				}
			});
		}
	} else {
		// Regular user is logged in
		toReturn.render = function(callback) {
			// TODO: If there IS a competition going on, show that link.
			// Also, show relevant history
			var toReturn = '<!--Peasant in sidebar - Kokiri 0.1 -->'
			+ '\n<ul>'
			+ '\n\t<li><a href="/">Home</a></li>'
			+ '\n\t<li><a href="/about">About</a></li>'
			+ '\n</ul>'

			competitions.GetListOfCompetitions({ 'get_current': true, 'get_future': false, 'get_previous': false }, function(comps, err){
				if (err) {
					callback(null, err);
				} else {
					toReturn += '\n<b>Current Competitions</b>';
					toReturn += '\n<ul>';
					for (var i = 0; i < comps.length; i++) {
						toReturn += '\n\t<li><a href="c?n=' + comps[i].id + '">' + comps[i].name + '</a></li>';
					}
					toReturn += '\n</ul>';
					getPreviousCompetitions();
				}
			});

			+ '\n<hr>'
			+ '\n<b>Previous Competitions</b>'
			+ '\n<ul>';

			function getPreviousCompetitions() {
				competitions.GetListOfCompetitions({ 'get_future': false, 'get_current': false, 'get_previous': true }, function(comps, err) {
					if (err) {
						callback(null, err);
					} else {
						for (var i = 0; i < comps.length; i++) {
							toReturn += '\n\t<li><a href="c?n=' + comps[i].id + '">' + comps[i].name + '</a></li>';
						}
						toReturn += '\n</ul>';
						callback(toReturn);
					}
				});
			}
		};
	}

	return toReturn;
}

exports.GenerateSidebar = GenerateSidebar