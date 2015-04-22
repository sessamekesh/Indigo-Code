/**
 * Created by Kamaron on 4/22/2015.
 */

var index = require('../general/index');

exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora'
    };

    index.fill_data(params, function (new_data) {
        exports.fill_data(new_data, function (newer_data) {
            res.render('./general/register', newer_data);
        });
    });
};

exports.fill_data = function (data, cb) {
    data = data || {};

    // Grab information required for registration (max team size, etc)
    // TODO KIP: Grab from competition instead
    data.comp_data = {
        id: 0,
        max_team_size: 3,
        name: "Test Prototyping Competition",
        start_date: Date.now(),
        end_date: Date.now() + (1000*60*60)
    };

    cb(data);
};