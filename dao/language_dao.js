'use strict';

var mysql = require('mysql'),
	credentials = require('./credentials');

var connection,
	active_query_count = 0;

function getConnection() {
	if (!connection) {
		connection = mysql.createConnection(credentials.getCredentials());
	}

	return connection;
}

function reportQueryActive() {
	active_query_count++;
}

function reportQueryEnded() {
	active_query_count--;
	if (active_query_count == 0) {
		console.log('Closing connection problem_dao...');
		connection.end();
		connection = undefined;
	} else if (active_query_count < 0) {
		console.log('problem_dao: wierd bug: somehow less than 0 connections are open');
	}
}

// TODO KJP: How do you compile a program?

function getLanguageList(callback) {
	console.log('language_dao: Getting list of languages supported by the framework.');
	getConnection().query('SELECT id, name, subsys_name FROM Language;', function (err, rows) {
		if (err) {
			callback(null, err);
		} else {
			callback(rows);
		}
		reportQueryEnded();
	});
	reportQueryActive();
}

function getLanguageData(languageID, callback) {
	console.log('language_dao: Getting data for language with id ' + languageID);
	getConnection().query('SELECT id, name, subsys_name FROM Language WHERE id = ?;', languageID, function (err, rows) {
		if (err) {
			callback(null, err);
		} else if (rows.length != 1) {
			callback(null, 'Number of rows returned was ' + rows.length + ', not 1.');
		} else {
			callback(rows[0]);
		}
		reportQueryEnded();
	});
	reportQueryActive();
}

exports.getLanguageList = getLanguageList;
exports.getLanguageData = getLanguageData;