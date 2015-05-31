/**
 * Created by Kamaron on 5/30/2015.
 */

'use strict';

var admin_layer = require('./index');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

/**
 * Get will only happen if the form failed to submit last time
 * @param req
 * @param res
 */
exports.get = function (req, res) {

};

/**
 * Post will happen if the form was submitted via the last step (new-comp)
 * @param req
 * @param res
 */
exports.post = function (req, res) {
    exports.fill_data(req, {
        title: 'Create a New Competition',
        subtitle: 'Step 2 / 3: Administrator team members',
        redirect_url: '/admin/new-comp-team-select' // TODO KIP; This may not be wise, unless you use session data
    }, function (new_data) {
        res.render('./admin/new-comp-team-select.jade', new_data);
    });
};

/**
 * Fill in data required for team selection, especially the current admin team of this team.
 * @param req {object}
 * @param data {object}
 * @param cb {function (NewData: object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    // Get page errors from session, if they exist. If not, create a new, empty object
    data.page_errors = req.session.new_comp_errors || new RegistrationPageErrorCollection();
    req.session.new_comp_errors = null;

    // Get the current admin team
    // TODO KIP: Do that.
    data.admins_list = [{username: 'Sessamekesh'}];

    // Get the comp data of the competition in question
    // TODO KIP: Make sure this information is passed on in POST everywhere that ends up here.
    data.comp_data = req.body.comp_data;

    admin_layer.fill_data(req, data, function (new_data) {
        cb(new_data);
    });
};