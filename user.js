'use strict';

// Login.js - login system for Kokiri

var mysql = require('mysql');

function getUserData(userName, password, loginCallback) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	console.log('Attempting to log in...');

	var query,
		resultUser;

	// TODO: Encryption on passwords
	query = connection.query('SELECT id, name, username, tagline, is_admin, highest_complete FROM Users'
		+ ' WHERE username=? AND pass=?;', [userName, password]);

	query.on('error', function(err) {
		console.log('Failed to grab user - ' + err);
	});

	query.on('result', function(result) {
		console.log('User found!');
		resultUser = {
			user_id: result.id,
			username: result.username,
			name: result.name,
			tagline: result.tagline,
			is_admin: result.is_admin[0],
			highest_complete: result.highest_complete
		};
		console.log(resultUser);
	});

	query.on('end', function(result) {
		console.log('SQL connection closed. Calling callback...');
		console.log(loginCallback);
		connection.end();
		loginCallback(resultUser);
	});
}

function updateUserData(userName, userData) {
	// TODO: Write function to update user data...
	
}

function registerUser(userData, callback) {
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'kokiri',
		password: 'v1.0',
		database: 'kokiri'
	});

	if (!callback) {
		callback = function(err) { console.log('Error in registerUser: ' + err); }
	}

	console.log('Invoked registerUser function of user.js');
	console.log('Fields received:');
	console.log(userData);

	var query, userToInsert;

	if (!userData) {
		callback('No user object provided!');
		return;
	}

	// Populate the data for user to insert...
	if (!userData.userName) {
		callback('No user name provided');
		return;
	}

	if (!userData.password) {
		callback('No password provided');
		return;
	}

	if (!userData.name) {
		userData.name = '';
	}

	if (!userData.tagline) {
		userData.tagline = '';
	}

	if (!userData.is_admin) {
		userData.is_admin = false;
	}

	if (!userData.highest_complete) {
		userData.highest_complete = '';
	}

	console.log('Registering user: ' + userData.userName);

	// TODO: Async this, bitch!
	connection.query('INSERT INTO Users (username, pass, name, tagline, is_admin, highest_complete) VALUES (?, ?, ?, ?, ?, ?);',
		[userData.userName, userData.password, userData.name, userData.tagline, userData.is_admin, userData.highest_complete],
		function(err) {
			if(err) {
				callback(err);
				return;
			} else {
				callback();
				return;
			}
		});
	connection.end();
}

exports.getUserData = getUserData;
exports.registerUser = registerUser;