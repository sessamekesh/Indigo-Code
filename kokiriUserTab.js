function GenerateUserTab(userData) {
	var userInfo = {
		render: function(callback) {
			var toReturn = '';

			if (!userData) {
				toReturn += '<form action="/login" method="post">';
				toReturn += '\n\t<input type="text" name="username" value="Username" /><br />';
				toReturn += '\n\t<input type="password" name="password" value="" /><br />';
				toReturn += '\n\t<input type="submit" value="Login" />';
				toReturn += '\n\t<input type="submit" name="register" value="Register" />';
				toReturn += '\n</form>';
			} else if (!userData.valid || userData.valid == false) {
				toReturn += '<span>Incorrect login credentials!</span>';
				toReturn += '\n<form action="/login" method="post">';
				toReturn += '\n\t<input type="text" name="username" value="' + userData.username + '" /><br />';
				toReturn += '\n\t<input type="password" name="password" value="" /><br />';
				toReturn += '\n\t<input type="submit" name="submit" value="Login" />';
				toReturn += '\n\t<input type="submit" name="register" value="Register" />';
				toReturn += '\n</form>';
			} else {
				// If the user is an admin, use bold
				if (userData.is_admin == true) {
					toReturn += '<span>Hello, sir <b>' + userData.username + '</b></span><br />';
					toReturn += '\n<i>' + userData.tagline + '</i>';
					toReturn += '\n<form action="/logout" method="post">';
					toReturn += '\n\t<input type="submit" value="Logout" />';
					toReturn += '\n</form>';
				} else {
					toReturn += '<span>Hello ' + userData.username + '</span><br />';
					toReturn += '\n<i>' + userData.tagline + '</i>';
					toReturn += '\n<form action="/logout" method="post">';
					toReturn += '\n\t<input type="submit" value="Logout" />';
					toReturn += '\n</form>';
				}
			}

			callback(toReturn);
		}
	};

	return userInfo;
}

exports.GenerateUserTab = GenerateUserTab;