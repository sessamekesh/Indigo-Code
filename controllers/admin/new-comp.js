/**
 * Created by Kamaron on 5/30/2015.
 */

'use strict';

// NEXT VERSION: You know what would also be good? If you could have god damn recursive
//  directory structure - so, a views/admin/new-comp/team-select, instead of views/admin/new-comp-team-select
//  for where this page goes next.

var admin_layer = require('./index');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Create a New Competition',
        subtitle: 'Step 1 / 3: General competition data',
        redirect_url: '/admin/new-comp'
    }, function (new_data) {
        res.render('./admin/new-comp.jade', new_data);
    });
};

/**
 * Fill in data required for the new-comp page. This includes any data passed back
 *  if a previous request failed, availability of build machines, etc.
 * @param req {object}
 * @param data {object}
 * @param cb {function(NewData: object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    // Get page errors from session, if they exist, or just create a new, empty object.
    data.page_errors = req.session.new_comp_errors || new RegistrationPageErrorCollection();
    req.session.new_comp_errors = null;

    admin_layer.fill_data(req, data, function (new_data) {
        cb(new_data);
    });
};