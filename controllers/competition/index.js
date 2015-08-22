/**
 * Created by Kamaron on 5/27/2015.
 */

var general_layer = require('../general/index');
var CompetitionDescription = require('../../models/CompetitionDescription');
var compDao = require('../../dao/competition_dao');

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: req.comp_data.name,
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/competition/' + req.comp_data.id + '/'
    }, function (new_data) {
        // I'm putting this here, because it only applies to the index page.
        new_data.comp_desc = new CompetitionDescription(new_data.comp_data);

        res.render('./competition/descriptions/' + req.comp_data.id + '.jade', new_data);
    });
};

/**
 * Fill data in general for competition layer pages. Call for all other competition pages.
 * @param req {object} Request object. I don't know what type it is, but it definitely has a type
 * @param data {object} Data that is to be included in the final NewData object
 * @param cb {function(NewData: object)} Callback function, which will be given the NewData object, after filling in
 *            data relevant to the competition system.
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    data.user_data = req.user_data;
    data.team_data = req.team_data;
    data.comp_data = req.comp_data;

    // TODO KAM: Fill in problems here
    compDao.getProblemsInCompetition(req.comp_data.id, function (err, res) {
        if (err) {
            console.log('AN ERROR OCCURRED FETCHING PROBLEMS: ' + err.message);
        }

        data.problemList = res.filter(function (problem) {
            return problem.isValid || data.user_data.is_admin;
        });

        data.problemList = data.problemList || [];

        general_layer.fill_data(req, data, function (new_data) {
            cb(new_data);
        });
    });
};