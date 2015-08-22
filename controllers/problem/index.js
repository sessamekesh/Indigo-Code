/**
 * Created by Kamaron on 8/21/2015.
 */

var ProblemDescription = require('../../models/ProblemDescription').ProblemDescription;
var competitionLayer = require('../competition/index');

/**
 * @param req
 * @param res
 */
exports.get = function (req, res) {
    exports.fill_data(req, {
        title: req.problemData.name,
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id
    }, function (newData) {
        newData.problemDescription = new ProblemDescription(newData.problemData);

        res.render('./problem/descriptions/' + req.problemData.id + '.jade', newData);
    });
};

/**
 * Fill data in general for problem layer pages. Call for all other problem pages.
 * @param req
 * @param data
 * @param cb {function (NewData: object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    competitionLayer.fill_data(req, data, function (newData) {
        newData.problemData = req.problemData;

        cb(newData);
    });
};