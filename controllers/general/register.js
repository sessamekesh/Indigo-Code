/**
 * Created by Kamaron on 4/22/2015.
 */

var index = require('../general/index'),
    comp_dao = require('../../dao/competition_dao');

exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/register' + (req.query.id !== undefined ? ('?id=' + req.query.id) : ''),
        comp_id: req.query.id
    };

    exports.fill_data(req, params, function (data) {
        res.render('./general/register', data);
    });
};

exports.fill_data = function (req, data, cb) {
    data = data || {};

    data.include_scripts = data.include_scripts || [];
    data.include_scripts.push('/js/register_switch.js');

    // Grab information required for registration (max team size, etc)
    // TODO KIP: Grab from competition instead
    if (data.comp_id === undefined) {
        finish_this_func();
    } else {
        comp_dao.get_competition_data(data.comp_id, function (err, res) {
            if (err) {
                // TODO KIP: Re-evaluate usefulness of throwing errors as we receive them...
                throw err;
            } else {
                data.comp_data = res;
                finish_this_func();
            }
        });
    }

    function finish_this_func() {
        index.fill_data(req, data, function (new_data) {
            cb(new_data);
        });
    }
};