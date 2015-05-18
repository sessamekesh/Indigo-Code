/**
 * Created by Kamaron on 4/22/2015.
 */

'use strict';

var index = require('../general/index');
var comp_dao = require('../../dao/competition_dao');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/register' + (req.query.id !== undefined ? ('?id=' + req.query.id) : ''),
        comp_id: req.query.id,
        page_errors: new RegistrationPageErrorCollection(),
        field_values: {}
    };

    exports.fill_data(req, params, function (data) {
        if (data.error) {
            res.render('./error', data);
        } else {
            res.render('./general/register', data);
        }
    });
};

exports.fill_data = function (req, data, cb) {
    data = data || {};

    data.include_scripts = data.include_scripts || [];
    data.include_scripts.push('/js/register_switch.js');

    // Grab information required for registration (max team size, etc)
    if (isNaN(parseInt(data.comp_id))) {
        finish_this_func();
    } else {
        comp_dao.get_competition_data(data.comp_id, function (err, res) {
            if (err) {
                data.error = err;
            } else {
                data.comp_data = res;
            }
            finish_this_func();
        });
    }

    function finish_this_func() {
        index.fill_data(req, data, function (new_data) {
            cb(new_data);
        });
    }
};