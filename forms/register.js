'use strict';

// Callback format: userData, errMessage
function GenerateRegistrationForm(userName, callback) {

	if (!callback) {
		callback = function(err) { if(err) { console.log('Error on generating registration form - ' + err); } }
	}

	if (!userName) {
		userName = '';
	}

	var form = {
		// Callback: content, err
		render: function(callback) {
			var toReturn = '';

			toReturn += '<form action="/register" method="post">';
			toReturn += '\n\t<h2 style="text-align: center">Register for ACM Events</h2>';
			toReturn += '\n\t<label for="username">Username:</label>';
			toReturn += '\n\t<input type="text" name="username" value="' + userName + '"><br />';
			toReturn += '\n\t<label for="name">Name:</label>';
			toReturn += '\n\t<input type="text" name="name" value=""><br />';
			toReturn += '\n\t<label for="password">Password:</label>';
			toReturn += '\n\t<input type="password" name="password" value=""><br />';
			toReturn += '\n\t<label for="confirm_password">Confirm Password:</label>';
			toReturn += '\n\t<input type="password" name="confirm_password" value=""><br />';
			toReturn += '\n\t<label for="highest_completed_cs">Highest Completed CS class:</label>';
			toReturn += '\n\t<select name="highest_completed_cs">';
			toReturn += '\n\t\t<option value="cs0">Just starting</option>';
			toReturn += '\n\t\t<option value="cs1">CS 1 (CS1400)</option>';
			toReturn += '\n\t\t<option value="cs2">CS 2 (CS1410)</option>';
			toReturn += '\n\t\t<option value="cs3">CS 3 (CS2420)</option>';
			toReturn += '\n\t\t<option value="cs4">CS 3000+</option>';
			toReturn += '\n\t\t<option value="cs5">Undergraduate Degree</option>';
			toReturn += '\n\t\t<option value="cs6">Professional</option>';
			toReturn += '\n\t</select><br />';
			toReturn += '\n\t<label for="tagline">Tagline</label>';
			toReturn += '\n\t<input type="text" name="tagline" value="Message that will appear by your name to all users">';
			toReturn += '\n\t<input type="submit" name="submit" value="Register">';
			toReturn += '\n</form>';

			callback(toReturn);
		}
	};

	return form;
}

exports.GenerateRegistrationForm = GenerateRegistrationForm;