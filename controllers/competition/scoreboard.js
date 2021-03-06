/**
 * Created by Kamaron on 11/19/2015
 */

var comp_layer = require('./index');
var CompetitionDescription = require('../../models/CompetitionDescription');
var compDao = require('../../dao/competition_dao');

exports.get = function (req, res) {
	exports.fill_data(req, {
		title: 'Scores: ' + req.comp_data.name,
		subtitle: 'Version 0.3.1 - Zora',
		redirect_url: '/competition/' + req.comp_data.id + '/scoreboard'
	}, function (new_data) {
		res.render('./competition/scoreboard.jade', new_data);
	});
};

exports.fill_data = function(req, data, cb) {
	comp_layer.fill_data(req, data, function (new_data) {
		// TODO KAM: Get scoreboard data, pass on to new_data for use in scoreboard
		compDao.getProblemsInCompetition(new_data.comp_data.id, function (gperr, gpres) {
			if (gperr) {
				console.log('Error fetching problems:', gperr);
				new_data.problems = [];
			} else {
				new_data.problems = gpres;
			}

			new_data.include_scripts = new_data.include_scripts || [];
			new_data.include_stylesheets = new_data.include_stylesheets || [];

			new_data.include_scripts.push('https://cdn.socket.io/socket.io-1.3.5.js');
			new_data.include_scripts.push('/js/scoreboard-controller.js');
			//new_data.include_scripts.push('/jquery-ui/jquery-ui.js');
			//new_data.include_stylesheets.push('/jquery-ui/jquery-ui.css');

			cb(new_data);
		});
	});
};