/**
 * Created by Kamaron on 7/11/2015.
 *
 * This page identifies the build servers that are currently connected to the server
 */

'use strict';

var adminLayer = require('./index');
var BuildServerManager = require('../../buildServerManager/BuildServerManager').BuildServerManager;

/**
 * @param req {Object}
 * @param res {Object}
 */
exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Manage Build Server Connections',
        subtitle: '',
        redirect_url: '/admin/manage-buildserver-connections'
    }, function (new_data) {
        res.render('./admin/manage-buildserver-connections.jade', new_data);
    });
};

/**
 * Fill in data about the connected build systems
 * @param req {object}
 * @param data {object}
 * @param cb {function(NewData: Object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    // TODO: Get the list of connected build servers
    data.buildServers = BuildServerManager.getBuildServerList();

    adminLayer.fill_data(req, data, function (new_data) {
        cb (new_data);
    });
};