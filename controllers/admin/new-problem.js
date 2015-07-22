/**
 * Created by Kamaron on 7/21/2015.
 */

var RegistrationPageErrors = require('../../models/RegistrationPageErrorCollection');
var compDAO = require('../../dao/competition_dao');
var CompData = require('../../dao/competition_dao').CompData;
var async = require('async');

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Create a New Problem',
        subtitle: '',
        redirect_url: '/admin/new-problem'
    }, function (newData) {
        res.render('./admin/new-problem', newData);
    });
};

/**
 * Fill any data required for the new-problem page
 * @param req {Object}
 * @param data {Object}
 * @param cb {function(Object)=}
 */
exports.fill_data = function (req, data, cb) {
    data.page_errors = data.page_errors || new RegistrationPageErrors();

    async.parallel([
            compDAO.get_previous_competitions,
            compDAO.get_ongoing_competitions,
            compDAO.get_upcoming_competitions
        ],
        function (err, results) {
            results && results[0] && (data.previousCompetitions = results[0]);
            results && results[1] && (data.ongoingCompetitions = results[1]);
            results && results[2] && (data.upcomingCompetitions = results[2]);

            if (err) {
                console.log('Error fetching competitions - ', err);
                cb(data);
            } else {
                cb(data);
            }
        }
    );
};