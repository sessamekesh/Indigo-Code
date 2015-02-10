var fs = require('fs');

// TODO: Make this do a callback which passes the complete data...
function CreateBodyFromFragment(fragmentURI) {
	console.log('Creating a body from fragment: ' + fragmentURI);

	fragmentURI = './frags/' + fragmentURI + '.frag';
	var loadedData = '';

	if (fs.existsSync(fragmentURI)) {
		console.log('Loading fragment ' + fragmentURI);
		loadedData = fs.readFileSync(fragmentURI);
		return {
			// Callback: content, error
			render: function(callback) {
				callback(String(loadedData));
			}
		};
	} else {
		console.log('Fragment ' + fragmentURI + ' not found!');
		return {
			render: function(callback) { callback('PAGE NOT LOADED - fragment does not exist'); }
		}
	}

	return {
		render: function(callback) { callback('Deep shit - this is never suppoed to be reached! Check pageLoader.js'); }
	}
}

exports.CreateBodyFromFragment = CreateBodyFromFragment