/**
 * Created by kamaron on 9/1/15.
 *
 * Performs validation on the problem.
 */

// TODO KAM: You should create an accept header switch, so this provides JSON data if called somewhere requiring such

var getBaseData = require('./index').fill_data;
var problemDao = require('../../dao/problem_dao');
var async = require('async');
var BuildRequest = require('../../buildServerManager/models/BuildRequest').BuildRequest;

/**
 * Fill in data required for this page (and any page that builds on this page)
 * @param req Request object
 * @param data {object} Existing data
 * @param cb {function (newData : Object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    getBaseData(req, data, cb);
};

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Validation for problem ' + req['problemData']['name'],
        redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/validate'
    }, function (newData) {

        async.waterfall([
            // Get sample solutions
            function (callback) {
                problemDao.getAttachedSampleSolutions(req['problemData']['id'], callback);
            }
            // Run all sample solutions
            , function (sampleSolutions, callback) {
                async.map(sampleSolutions, function(sampleSolution, callback) {
                    // Run the sample solution given as a full on build request!
                    //  Finally, an opportunity to test the system!
                    callback(new Error('The validation step has not yet been created!'));

                    // callback(null, BuildResult);
                }, callback);
            }
        ], function (err, results) {
            if (err) {
                res.status(500).render('./error', {
                    error: err,
                    message: err.message
                });
            } else {
                newData.results = results;
                res.render('./validate', newData);
            }
        });
    });
};