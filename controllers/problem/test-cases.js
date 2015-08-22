/**
 * Created by Kamaron on 8/22/2015.
 */

var getBaseData = require('./index').fill_data;
var problemDao = require('../../dao/problem_dao');
var ProblemData = problemDao.ProblemData;

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Test Case Data',
        subtitle: 'Version 0.3.1 Zora',
        redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/test-case'
    }, function (newData) {
        res.render('./problem/test-cases.jade', newData);
    });
};

/**
 * Fill in data required for this page (and any page that builds on this page)
 * @param req Request object
 * @param data {object} Existing data
 * @param cb {function (newData : Object)}
 */
exports.fill_data = function (req, data, cb) {
    // Get list of test cases attached to this problem...
    problemDao.getAttachedTestCases(req.problemData.id, function (err, res) {
        if (err) {
            console.log('Error fetching test cases for problem ' + req.problemData.name + ': ' + err.message);
        }

        data.testCases = res || [];

        getBaseData(req, data, function (newData) {
            cb(newData);
        });
    });
};