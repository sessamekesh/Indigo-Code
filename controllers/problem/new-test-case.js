/**
 * Created by Kamaron on 8/22/2015.
 */

var getBaseData = require('./index').fill_data;
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

exports.get = function (req, res) {
    // Only allow access to this page if admin!
    if (req.user_data['is_admin'] === true) {
        exports.fill_data(req, {
            title: 'Add Test Case',
            redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/new-test-case'
        }, function (newData) {
            res.status(200).render('./problem/new-test-case', newData);
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
    data.pageErrors = data.pageErrors || new RegistrationPageErrorCollection();

    getBaseData(req, data, function (newData) {
        cb(newData);
    });
};