'use strict';

var subsystem = {},
	comp_subsystem = {};

/* --------Competition Subsystem-------- *\
	- Anything dealing with any competition passes through this gate
	-- This includes administrative competition functions
	-- This includes viewing problems
	-- This includes submissions

	- This gate is where users are authorized to access a competition
	----- PASS CONDITIONS -----
	: Competition is public and expired
	: Competition is ongoing, user is an admin or peasant
	: Competition is expired and private, user is an admin or peasant
	: Competition is upcoming, user is an admin

	----- FAIL CONDITIONS -----
	: Competition is non-public and user is a guest
	: Competition is upcoming and user is a peasant or guest
	: Competition is ongoing and user is a guest

	------ Competition Subsystems -----
	The function 'route' changes for competition subsystems. Any subsystems
	 that are part of a specific competition (denoted by 'c' followed by a number,
	 like c01, c2, or c123) are instead routed through the comp_subsystem object.
	This behaves like the subsystem object, but the route function should instead have
	 this prototype:

	route(respone, request, remainingPath, compData)

	 where compData is an object with the following properties:
	 {
		id, name, is_private, start_date, end_date
	 }

	This is a nice caching method, don't you think?

	----------- Improvements for V0.3 -----------
	- Cache user authorization statuses - instead of hitting MySQL database each time
	++ Cache competitions in system itself (store for some time all data, check against cached values?)
*/

// Callback:
// void callback(result, compData, authNodes, err)
// -result: true if authorized, false if not. compData will be null if not authorized
// -compData: Competition data { id, name, is_private, start_date, end_date }
// -authNotes: if compData is null, reason they were denied access
// -err: If an SQL error occurred, what the SQL error was
function gatekeeper(userData, compID, callback) {

}

function route(response, request, remainingPath) {
	console.log('Subsystem competition activated - remaining path: ' + remainingPath);

	var subsys_name = remainingPath;
	if (remainingPath && remainingPath.indexOf('/', 1) > 0) {
		subsys_name = remainingPath.substr(0, remainingPath.indexOf('/', 1));
	}

	// Begin routing...
	if (remainingPath && remainingPath !== '') {
		// Check to see if the competition is specified...
		if (/^[c]{1}\d+/.test(remainingPath)) {
			// There is a competition specified. Check authorization,
			//  route to subsystem if appropriate
			gatekeeper(request.session.data.user, /^c{1}\d+/.exec(remainingPath).substr(1),
				function(result, compData, authNotes, err) {
					if (result) {
						if (comp_subsystem[subsys_name]) {
							if (remainingPath.indexOf('/', 1) > 0) {
								comp_subsystem[subsys_name].route(response, request, compData, remainingPath.substr(remainingPath.indexOf('/', 1)));
							} else {
								comp_subsystem[subsys_name].route(response, request, compData);
							}
						} else {
							console.log('Subsystem ' + subsys_name + ' not found!');
							response.writeHead(404, {'Content-Type': 'text/plain'});
							response.write('404 not found! (Subsystem - competition)');
							response.end();
						}
					} else {
						if (err) {
							console.log('Error authorizing user: ' + err);
							// Generate authorization failed page
						} else {
							console.log('User rejected from competition subsystem: ' + authNotes);
							// Generate rejection page
						}
					}
				});

		} else {
			// Check against subsystems in the regular fashion.
			//  This is for static competition pages.
			if (subsystem[subsys_name]) {
				console.log('Forwarding request to subsystem ' + subsys_name);
				if (remainingPath.indexOf('/', 1) > 0) {
					subsystem[subsys_name].route(response, request, remainingPath.substr(remainingPath.indexOf('/', 1)));
				} else {
					subsystem[subsys_name].route(response, request);
				}
			} else {
				console.log('Subsystem ' + subsys_name + ' not found!');
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.write('404 not found! (Subsystem - competition)');
				response.end();
			}
		}
	} else {
		console.log('Action not found. Reporting 404 (user)');
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.write('404 not found! (Subsystem - competition)');
		response.end();
	}
}

exports.route = route;