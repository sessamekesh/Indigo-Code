// Returns a GoronPage with a render() function
//  This is streamlined for error messages, and as such has
//  different formats and whatnot.

var generic_page = require('./generic_page');

// NEXT VERSION: This is a fun feature, but it also represents a
//  security risk. Please remove it.

var image_message_combos =
	[{
		img: 'http://media-cache-ak0.pinimg.com/736x/02/ac/e8/02ace83b68fc78e54ca9f3bb98727d8f.jpg',
		width: 166,
		height: 180,
		msg: 'Occurred, an error has.'
	},
	{
		img: 'http://www.zachstronaut.com/posts/images/mario-404.png',
		width: 360,
		height: 240,
		msg: 'You need 8 more worlds full of 404'
	},
	{
		img: 'http://media-cache-ak0.pinimg.com/236x/4f/5e/19/4f5e19f71d272b2f42fcc80a5ab85790.jpg',
		width: 236,
		height: 260,
		msg: 'Zelda not found'
	},
	{
		img: 'http://i0.kym-cdn.com/photos/images/newsfeed/000/581/296/c09.jpg',
		width: 340,
		height: 255,
		msg: 'Wow'
	}],
	next_msg = 0;

function GoronErrorPage(userData, errName, errMessage) {
	console.log('Creating an error page for display: ' + errName + "(" + errMessage + ")");

	var nextMessage = image_message_combos[next_msg].msg,
		nextWidth = image_message_combos[next_msg].width,
		nextHeight = image_message_combos[next_msg].height,
		nextSrc = image_message_combos[next_msg].img;
	next_msg = (next_msg + 1) % image_message_combos.length;

	return generic_page.GoronPage({
		title: '(Goron) ' + errName,
		header: generic_page.GoronHeader({
			title: 'Error: ' + errName,
			subtitle: '(Goron) ' + errMessage,
			user_infor: generic_page.GoronUserInfo(userData)
		}),
		sidebar: generic_page.GoronSidebar(userData),
		body: {
			render: function(callback) {
			callback('<img src="' + nextSrc + '" width="' + nextWidth + '" height="' + nextHeight + '" style="float: left; margin: 8px; border-radius: 15px;" />'
				+ '\n<h1>' + nextMessage + '</h1>'
				+ '\n<h2>' + errMessage + '</h2>');
			}
		}
	});
}

exports.GoronErrorPage = GoronErrorPage;