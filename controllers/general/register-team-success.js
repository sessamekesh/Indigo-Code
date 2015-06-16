/**
 * Created by Kamaron on 5/22/2015.
 */

'use strict';

var index = require('../general/index');

exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/register-team-success'
    };

    exports.fill_data(req, params, function (data) {
        if (data.error) {
            res.render('./error', data);
        } else {
            res.render('./general/register-team', data);
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