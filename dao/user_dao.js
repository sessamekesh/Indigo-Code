'use strict';

var mysql = require('mysql'),
	credentials = require('./credentials'),
	bcrypt = require('bcrypt'),
	entities = require('entities');

var connection,
	active_query_count = 0,
	work_factor = 10;

function getConnection() {
	if (!connection) {
		connection = mysql.createConnection(credentials.getCredentials());
	}

	// NEXT VERSION: Handle connection errors here

	return connection;
}

// NEXT VERSION: Build in reportQueryActive and
//  reportQueryEnded so you don't have to manually call them.
function reportQueryActive() {
	active_query_count++;
	console.log('user_dao query count: ' + active_query_count);
}

function reportQueryEnded() {
	active_query_count--;
	console.log('user_dao query count: ' + active_query_count);
	if (active_query_count == 0) {
		console.log('Closing connection user_dao...');
		connection.end();
		connection = undefined;
	}
}

exports.checkUserExists = function (username, callback) {
	if (username === undefined || username === '') {
		callback (false);
	} else {
		getConnection().query('SELECT id FROM User WHERE user_name = ?;', username, function (err, res) {
			if (err) {
				callback (false);
			} else {
				callback (res.length > 0);
			}
			reportQueryEnded();
		});
		reportQueryActive();
	}
}

exports.authUser = function (username, password, callback) {
	if (username === undefined || username === '') {
		callback(false, 'No username provided!');
	} else if (password === undefined || password === '') {
		callback(false, 'No password provided!');
	} else {
		console.log('user_dao: Authenticating user ' + username);
		getConnection().query('SELECT pass_hash FROM User WHERE user_name = ?;', username,
			function (err, res) {
				if (err) {
					callback(false, 'SQL err: ' + err);
				} else if (res.length != 1) {
					callback(false, 'User not found');
				} else {
					auth_user(res[0].pass_hash);
				}
				reportQueryEnded();
			}
		);
		reportQueryActive();
	}

	function auth_user(ph) {
		bcrypt.compare(password, ph, function (err, res) {
			if (err) {
				callback (false, 'Error authenticating password: ' + err);
			} else {
				callback (res);
			}
		});
	}
};

// Callback format: userData, err
function getUserData(userDesc, callback) {
	console.log('user_dao: Retrieving user data for');
	console.log(userDesc);

	if (!userDesc) {
		console.log('No user description provided. Selecting all users...');
		// No user description provided - simply fetch all usernames and return them.
		var query = getConnection().query('SELECT id, user_name FROM User;');
		reportQueryActive();
		var userList = [];
		var error_generated = false;
		query.on('error', function(err) {
			error_generated = true;
			callback(null, err);
		});
		query.on('result', function(result) {
			userList.push({ id: id, user_name: result.user_name });
		});
		query.on('end', function() {
			if (!error_generated) {
				callback(userList);
			}
			reportQueryEnded();
		});
	} else if (userDesc.user_name || userDesc.id) {
		// Grabbing one user only.
		if (userDesc.user_name && userDesc.password) {
			console.log('Retrieving user data with username and password');
			// Traditional login (return everything)
			// Grab the associated password hash...
			var hash_query = getConnection().query('SELECT pass_hash FROM User WHERE user_name = ?;',
				entities.encodeHTML(userDesc.user_name));
			reportQueryActive();
			var hash_error_generated = false;
			var hash_result;
			hash_query.on('error', function(err) {
				hash_error_generated = true;
				callback(null, 'Error retrieving password hash - ' + err);
			});
			hash_query.on('result', function(result) {
				hash_result = result.pass_hash;
			});
			hash_query.on('end', function() {
				reportQueryEnded();
				if (!hash_error_generated) {
					authenticateUser(hash_result);
				}
			});
		} else if(userDesc.id) {
			console.log('Using userID');
			// Grab user by id - use internally, requires no password authentication
			var query = getConnection().query('SELECT id, email_address, can_share_email, user_name, name, is_admin FROM User WHERE id = ?;',
				userDesc.id);
			reportQueryActive();
			var error_generated = false;
			var result;
			query.on('error', function(err) {
				callback(null, err);
				error_generated = true;
			});
			query.on('result', function(res) {
				result = {
					id: res.id,
					name: res.name,
					user_name: res.user_name,
					is_admin: res.is_admin[0],
					email: res.email_address,
					can_share_email: res.can_share_email[0]
				};
			});
			query.on('end', function() {
				reportQueryEnded();
				if (!error_generated) {
					callback(result);
				}
			});
		} else {
			console.log('Using only username ' + userDesc.user_name);
			// Grab user only using user_name: unauthenticated, only return
			//  non-sensitive data about them.
			var query = getConnection().query('SELECT id, user_name, is_admin FROM User WHERE user_name = ?;',
				entities.encodeHTML(userDesc.user_name));
			reportQueryActive();
			var error_generated = false;
			var result;
			query.on('error', function(err) {
				callback(null, err);
				error_generated = true;
			});
			query.on('result', function(res) {
				result = {
					id: res.id,
					name: res.name,
					user_name: res.user_name,
					is_admin: res.is_admin[0]
				};
			});
			query.on('end', function() {
				if (!error_generated) {
					callback(result);
				}
				reportQueryEnded();
			});
		}
	} else {
		// Case not covered
		callback(null, 'Case for provided user description not provided in user_dao.js');
	}

	function authenticateUser(pass_hash) {
		console.log('Authenticating user password against hash ' + pass_hash);
		if (!pass_hash) {
			callback(null, 'No password hash provided in authentication. Check username.');
		} else {
			bcrypt.compare(userDesc.password, pass_hash, function(err, res) {
				if (err) {
					callback(null, 'Error in authenticating password - ' + err);
				} else {
					if (res === true) {
						console.log('Authentication success. Returning user data...');
						var query = getConnection().query('SELECT id, user_name, name, is_admin FROM User WHERE user_name = ?;',
							entities.encodeHTML(userDesc.user_name));
						var result;
						reportQueryActive();
						var error_generated = false;
						query.on('error', function(err) {
							error_generated = true;
							callback(null, 'Error retreiving MYSQL data - ' + err);
						});
						query.on('result', function(res) {
							console.log('User found - ' + res.user_name);
							result = {
								id: res.id,
								name: res.name,
								user_name: res.user_name,
								is_admin: res.is_admin[0]
							};
						});
						query.on('end', function() {
							reportQueryEnded();
							if (!error_generated) {
								callback(result);
							}
						});
					} else {
						callback(null, 'Incorrect password');
					}
				}
			});
		}
	}
}

// callback: userData, err
function addUser(userDesc, callback) {
	console.log('user_dao: Adding user data for:');
	console.log(userDesc);

	// Required fields: user_name, name, password, tagline
	if (!userDesc) {
		callback(null, 'No userDesc parameter passed - cannot create user');
	} else if (!userDesc.user_name) {
		callback(null, 'No user_name property of userDesc passed - cannot create user');
	} else if (!userDesc.name) {
		callback(null, 'No name property of userDesc passed - cannot create user');
	} else if (!userDesc.password) {
		callback(null, 'No password property of userDesc passed - cannot create user');
	} else if (!userDesc.email) {
		callback(null, 'No email property of userDesc passed - cannot create user');
	} else if (!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/.test(userDesc.email)) {
		callback(null, 'Not a valid email addresss!');
	} else if (!userDesc.is_student) {
		callback(null, 'Not specified if student or not');
	} else {
		// Make sure there is no user with given username...
		getUserData({ user_name: userDesc.user_name }, function(user, err) {
			if (err) {
				callback(null, 'Error checking for existing user: ' + err);
			} else {
				if (user) {
					callback(null, 'Username ' + userDesc.user_name + ' already taken!');
				} else {
					encryptPassword();
				}
			}
		});
	}

	function encryptPassword() {
		console.log('Encrypting password...');
		// Encrypt password, carry on to insertData
		bcrypt.genSalt(work_factor, function(err, salt) {
			if (err) {
				callback(null, 'Error generating salt - ' + err);
			} else {
				console.log('Salt generated - ' + salt);
				bcrypt.hash(userDesc.password, salt, function(err, hash) {
					if (err) {
						callback(null, 'Error encrypting password ' + err);
					} else {
						console.log('Done. Hash: ' + hash);
						insertData(hash);
					}
				});
			}
		});
	}

	function insertData(pw_hash) {
		console.log('Inserting data...');
		console.log(userDesc);
		console.log('pw_hash: ' + pw_hash);
		var insert_query = getConnection().query('INSERT INTO User (user_name, name, pass_hash, email_address, is_student) VALUES (?, ?, ?, ?, ?);',
			[entities.encodeHTML(userDesc.user_name), entities.encodeHTML(userDesc.name), pw_hash, userDesc.email, userDesc.is_student]);
		reportQueryActive();
		var error_generated = false;
		var toReturn;
		insert_query.on('error', function(err) {
			callback(null, err);
			error_generated = true;
		});
		insert_query.on('end', function() {
			if (!error_generated) {
				getUserData({ user_name: userDesc.user_name, password: userDesc.password }, callback);
			}
			reportQueryEnded();
		});
	}
}

function updateUser(userID, updateFields, callback) {
	console.log('user_dao: Updating user data for userID ' + userID);

	if (!userID || userID < 0) {
		callback(null, 'No user ID provided');
	} else if (!updateFields) {
		callback(null, 'No fields to update provided');
	} else if (updateFields.id) {
		callback(null, 'Cannot update primary key user ID');
	} else {
		var queryAddons = [];
		var first = true;
		var queryString = 'UPDATE ';
		valuesBit = ' VALUES (';

		// TODO: queryAddons will be a just array of values.
		if (updateFields.name) {
			queryAddons.push(updateFields.name);
			queryString += 'name';
			valuesBit += '?';
			first = false;
		}
		if (updateFields.user_name) {
			queryAddons.push(entities.encodeHTML(updateFields.user_name));
			queryString += (first) ? 'user_name' : ', user_name';
			valuesBit += (first) ? '?' : ', ?';
		}
		if (updateFields.pass_hash) {
			queryAddons.push(updateFields.pass_hash);
			queryString += (first) ? 'pass_hash' : ', pass_hash';
			valuesBit += (first) ? '?' : ', ?';
		}
		if (updateFields.is_admin) {
			queryAddons.push(updateFields.is_admin);
			queryString += (first) ? 'is_admin' : ', is_admin';
			valuesBit += (first) ? '?' : ', ?';
		}

		queryString += valuesBit + ');';

		var query = getConnection().query(queryString, queryAddons);
		var didError = false;
		reportQueryActive();
		query.on('error', function(err) {
			callback(null, err);
			didError = true;
		});
		query.on('end', function() {
			// Grab the new user
			reportQueryEnded();
			getUserData({ id: userID }, callback);
		});
	}
}

exports.getUserData = getUserData;
exports.addUser = addUser;
exports.updateUser = updateUser;