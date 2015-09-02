/**
 * Created by kamaron on 9/1/15.
 */

var getBaseData = require('./index').fill_data;
var problemDao = require('../../dao/problem_dao');

/**
 * @type {BuildServerManager}
 */
var BuildManager;

exports.get = function (req, res) {
    // Only allow access to this page if admin, or the competition has ended!
    if (req['user_data']['is_admin'] === true || req['comp_data']['end_date'] < Date.now()) {
        exports.fill_data(req, {
            title: 'Sample Solutions',
            redirect_to: '/competition/' + req['comp_data']['id'] + '/problem/' + req['problemData']['id'] + '/sample-solutions'
        }, function (newData) {
            res.status(200).render('./problem/sample-solutions', newData);
        });
    } else {
        res.status(401).render('./error', new Error('Must be administrator to view this page!'));
    }
};

/**
 * @param req
 * @param data {object}
 * @param cb {function (newData: object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    getBaseData(req, data, function (newData) {
        problemDao.getAttachedSampleSolutions(req['problemData']['id'], function (err, res) {
            if (err) {
                console.log('Error fetching sample solutions for problem ' + req['problemData']['id'] + ': ' + err.message);
            }

            data['sampleSolutions'] = res || [];

            cb(newData);
        });
    });
};

BuildManager = require('../../buildServerManager/BuildServerManager').BuildServerManager;