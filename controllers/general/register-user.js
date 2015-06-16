/**
 * Created by Kamaron on 6/15/2015.
 */

'use strict';

var index = require('../general/index');
var comp_dao = require('../../dao/competition_dao');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

/**
 * @param req {object} Request (Express)
 * @param res {object} Response (Express)
 */
exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/register-user',
        comp_id: req.query.id,
        page_errors: new RegistrationPageErrorCollection(),
        field_values: {}
    };

    exports.fill_data(req, params, function (new_data) {
        res.render('./general/register-user', new_data);
    });
};

/**
 * @param req {object} Request (Express)
 * @param data {object} Key-value object with data to pass to Jade file
 * @param cb {function (new_data: object)} Callback with data to pass from this page to Jade file.
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    index.fill_data(req, data, function (new_data) {
        cb(new_data);
    });
};