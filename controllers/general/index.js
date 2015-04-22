/**
 * Created by Kamaron on 4/22/2015.
 */

exports.get = function (req, res) {
    var params = {
        title: 'USU ACM Competition Framework',
        subtitle: 'Version 0.3.1 - Zora'
    };

    exports.fill_data(params, function (new_data) {
        res.render('./general/index', new_data);
    });
};

exports.fill_data = function (data, cb) {
    data = data || {};

    data.user_data = undefined; // TODO KIP: Get user data from session here
    data.previous_comps = []; // TODO KIP: Get list of previous competitions here
    data.upcoming_comps = []; // TODO KIP: Get list of upcoming competitions here
    data.ongoing_comps = []; // TODO KIP: Get list of ongoing competitions here

    cb(data);
};