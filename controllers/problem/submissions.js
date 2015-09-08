/**
 * Created by kamaron on 9/8/15.
 */

var async = require('async');

var getBaseData = require('./index').fill_data;
var submissionDao = require('../../dao/submission_dao');
var problemDao = require('../../dao/problem_dao');
var languageDao = require('../../dao/language_dao');

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Submissions for problem ' + req['problemData']['name']
    }, function (newData) {
        res.render('./problem/submissions', newData);
    });
};

/**
 * @param req
 * @param data {Object}
 * @param callback {function (newData: Object)}
 */
exports.fill_data = function (req, data, callback) {
    getBaseData(req, data || {}, function (newData) {
        submissionDao.getSubmissionsInProblem(req['problemData']['id'], function (dberr, dbres) {
            if (dberr) {
                console.log('Could not get submissions for problem ' + req['problemData']['id'], ':', dberr.message);
                newData.submissions = [];
            } else {
                newData.submissions = dbres;
            }

            problemDao.getAttachedTestCases(req['problemData']['id'], function (atcerr, atcres) {
                if (atcerr) {
                    console.log('Could not get test cases for problem ' + req['problemData']['id'], ':', atcerr.message);
                    newData.testCases = [];
                } else {
                    newData.testCases = atcres;
                }

                newData.include_scripts = newData.include_scripts || [];
                newData.include_stylesheets = newData.include_stylesheets || [];

                newData.include_scripts.push('https://cdn.socket.io/socket.io-1.3.5.js');
                newData.include_scripts.push('/js/build-results-listener.js');
                newData.include_scripts.push('/jquery-ui/jquery-ui.js');
                newData.include_stylesheets.push('/jquery-ui/jquery-ui.css');

                newData.languages = {};

                async.forEach(
                    newData.submissions,
                    function (submission, cb) {
                        languageDao.getLanguageData(submission.languageId, function (glderr, gldres) {
                            if (glderr) {
                                console.log('Could not get information about language', submission.languageId, ':', glderr.message);
                            } else {
                                newData.languages[submission.languageId] = gldres[0];
                            }

                            cb();
                        });
                    },
                    function () {
                        callback(newData);
                    }
                );
            });
        });
    });
};