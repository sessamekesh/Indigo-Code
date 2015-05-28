/**
 * Created by Kamaron on 5/27/2015.
 */

var general_layer = require('../general/index');

//var competition_dao = require('../../dao/competition_dao');
//
//exports.get = function (req, res) {
//    var params = {
//        title: 'USU ACM Competition Framework',
//        subtitle: 'Version 0.3.1 - Zora',
//        redirect_url: '/'
//    };
//
//    exports.fill_data(req, params, function (new_data) {
//        res.render('./general/index', new_data);
//    });
//};
//

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: req.comp_data.name,
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/competition/' + req.comp_data.id + '/'
    }, function (new_data) {
        res.render('./competition/index.jade', new_data);
    });
};

/**
 * Fill data in general for competition layer pages. Call for all other competition pages.
 * @param req {object} Request object. I don't know what type it is, but it definitely has a type
 * @param data {object} Data that is to be included in the final NewData object
 * @param cb {function(NewData: object)} Callback function, which will be given the NewData object, after filling in
 *            data relevant to the competition system.
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    data.user_data = req.user_data;
    data.team_data = req.team_data;
    data.comp_data = req.comp_data;

    general_layer.fill_data(req, data, function (new_data) {
        // TODO KIP: Add in additional data, to fill in comp_data object
        cb(new_data);
    });
};