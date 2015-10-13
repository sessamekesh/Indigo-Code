/**
 * Created by Kamaron on 5/30/2015.
 */

'use strict';

// NEXT VERSION: You know what would also be good? If you could have god damn recursive
//  directory structure - so, a views/admin/new-comp/team-select, instead of views/admin/new-comp-team-select
//  for where this page goes next.

var admin_layer = require('./index');
var RegistrationPageErrorCollection = require('../../models/RegistrationPageErrorCollection');

/**
 * Get may happen if the form fails to validate, so information will be filled in as it's available
 * @param req {object}
 * @param res {object}
 */
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
    data.page_errors = new RegistrationPageErrorCollection();

    if (req.session.new_comp_errors) {
        for (var page_err in req.session.new_comp_errors.errors) {
            if (req.session.new_comp_errors.errors.hasOwnProperty(page_err)) {
                data.page_errors.addError(page_err, req.session.new_comp_errors.errors[page_err]);
            }
        }
    }

    req.session.new_comp_errors = null;

    // TODO KIP: Insert in data that was valid

    admin_layer.fill_data(req, data, function (new_data) {
        cb(new_data);
    });
};