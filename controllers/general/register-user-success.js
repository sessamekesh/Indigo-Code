/**
 * Created by Kamaron on 6/15/2015.
 */

'use strict';

var index = require('../general/index');

/**
 * Endpoint to be called on successful registration. No view is attached to this.
 * @param req {Object} Request (Express)
 * @param res {Object} Response (Express)
 */
exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/register-user-success'
    };

    exports.fill_data(req, params, function (new_data) {
        if (new_data.error) {
            res.render('./error', new_data);
        } else {
            res.redirect('/'); // TODO KIP: Really? Is this necessary? Answer: No. This whole file is unnecessary.
        }
    });
};

exports.fill_data = function (req, data, cb) {
    data = data || {};

    if (req.body) {
        data.form_data = req.body;
    }

    index.fill_data(req, data, function (new_data) {
        cb(new_data);
    });
};