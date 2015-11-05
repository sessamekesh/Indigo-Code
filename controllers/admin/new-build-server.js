/**
 * Created by Kamaron on 11/5/2015.
 */

'use strict';

var admin_layer = require('./index');
var BuildServerManager = require('../../buildServerManager/BuildServerManager').BuildServerManager;
var BuildServer = require('../../buildServerManager/models/BuildServer').BuildServer;

/**
 * Display form
 * @param req {Object}
 * @param res {Object}
 */
exports.get = function (req, res) {
    admin_layer.fill_data(req, {
        title: 'Attach Buildserver',
        subtitle: 'Indigo Code',
        redirect_url: '/admin/new-build-server',
        comp_data: req.session.new_comp_data
    }, function (new_data) {
        res.render('./admin/new-build-server.jade', new_data);
    });
};

/**
 * Take form data in
 * @param req {Object}
 * @param res {Object}
 */
exports.post = function (req, res) {
    admin_layer.fill_data(req, {
        title: 'Attach Buildserver',
        subtitle: 'Indigo Code',
        redirect_url: '/admin/new-build-server',
        comp_data: req.session.new_comp_data
    }, function (new_data) {
        //req.body.prob_name
        // Attempt a new connection with the IP address and port provided
        var ip = req.body['ip_address'];
        var port = req.body['port_number'];

        var newBuildServer = new BuildServer(ip, port, 1, function (err) {
            if (err) {
                console.log('Error connecting to build server - ' + JSON.stringify((err)));
                new_data.error = err;
                new_data.message = err.message;
                res.render('./error', new_data);
            } else {
                BuildServerManager.registerBuildServer(newBuildServer, function (err2) {
                    if (err2) {
                        console.log('Error registering build server - ' + JSON.stringify(err2));
                        new_data.error = err2;
                        new_data.message = err2.message;
                        res.render('./error', new_data);
                    } else {
                        res.redirect('/admin/manage-buildserver-connections');
                    }
                });
            }
        });
    });
};