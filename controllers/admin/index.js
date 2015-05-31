/**
 * Created by Kamaron on 5/30/2015.
 */

// NEXT VERSION: You should totally do complete MVC, instead of this partial crap
//  you're doing right now... like, all objects should have models.

var general_layer = require('../general/index');

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Admin system homepage',
        subtitle: 'Version 0.3.1 - Zora',
        redirect_url: '/admin/'
    }, function (new_data) {
        res.render('./admin/index.jade', new_data);
    });
};

/**
 * Fill data in general for admin system. This gets called on all other admin pages.
 * @param req {object} Request object from Express.
 * @param data {object} Data that is to be included in the final NewData object
 * @param cb {function (NewData: object)} Callback function, given NewData object,
 *  after adding in admin relevant info
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    data.user_data = req.user_data;

    general_layer.fill_data(req, data, function (new_data) {
        // TODO KIP: Add in additional data, to fill in comp_data object.
        cb(new_data);
    });
};