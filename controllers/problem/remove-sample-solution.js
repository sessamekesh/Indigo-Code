/**
 * Created by kamaron on 9/8/15.
 *
 * In the next version, a more HTTPful thing to do would have been a DELETE request
 */

var rimraf = require('rimraf');

var getBaseData = require('./index').fill_data;
var problemDao = require('../../dao/problem_dao');

exports.get = function (req, res) {
    // Only allow access if admin
    if (req['user_data']['is_admin']) {
        console.log('Yep!');
        if (!isNaN(parseInt(req['query']['id']))) {
            problemDao.removeSampleSolution(req['query']['id'], function (dberr) {
                if (dberr) {
                    console.log('Error removing sample solution', req['query']['id'], ':', dberr.message);
                } else {
                    rimraf('./data/sample-solutions/' + req['query']['id'], function (rmrferr) {
                        if (rmrferr) {
                            console.log('Error deleting sample solution', req['query']['id'], 'from filesystem:', rmrferr.message);
                        }
                    });
                }
            });
        }
        res.redirect('/competition/' + req['comp_data']['id'] + '/problem/' + req['problemData']['id'] + '/sample-solutions');
    } else {
        var error = new Error('Access denied');
        res.status(403).render('./error', {
            error: error,
            message: error.message
        });
    }
};

/**
 * @param req
 * @param data {Object}
 * @param callback {function (newData: Object)}
 */
exports.fill_data = function (req, data, callback) {
    getBaseData(req, data, function (newData) {
        callback(newData);
    });
};