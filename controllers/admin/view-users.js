/**
 * Created by Kamaron on 6/16/2015.
 */

var admin_index = require('./index');
var user_dao = require('../../dao/user_dao');

/**
 * View information about the users
 * @param req {object} Request (Express)
 * @param res {object} Response (Express)
 */
exports.get = function (req, res) {
    exports.fill_data(
        req,
        {
            title: '[Admin] View User Data',
            subtitle: 'Version 0.3.1: Zora',
            redirect_url: '/admin/view-users',
            sort_by: req.query['sort-by'],
            sort_ascending: req.query['sort-ascending'],
            include_scripts: ['/jquery-ui/jquery-ui.js', '/js/view-users-controller.js'], // TODO: Replace with jquery-ui.min.js after testing is done
            include_stylesheets: ['/jquery-ui/jquery-ui.css'] // TODO: Replace with jquery-ui.min.css after testing is done
        },
        function (new_data) {
            if (new_data.error) {
                res.status(500).render('error', new_data.error);
            } else {
                res.render('admin/view-users', new_data);
            }
        }
    );
};

/**
 *
 * @param req {object} Request (Express)
 * @param data {object} Existing data that is pertinent to this method, and derived methods
 * @param cb {function ({object})} Callback method, sending the new data back to the caller
 */
exports.fill_data = function (req, data, cb) {
    var new_data = data || {};

    // Populate complete list of users for the admin view
    user_dao.getAllUsers({
        sensitive: false,
        sort_by: data.sort_by,
        sort_ascending: data.sort_ascending
    }, function (err, res) {
        if (err) {
            new_data.error = err;
        } else {
            new_data.user_entries = res;
        }

        cb(new_data);
    });
};