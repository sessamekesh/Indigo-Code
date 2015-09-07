/**
 * Created by Kamaron on 9/7/2015.
 *
 * Websocket connection for handling communication of the results of builds.
 */

var async = require('async');

var SocketNamespace = require('../models/SocketNamespace').SocketNamespace;
var submissionDao = require('../../dao/submission_dao');

var BuildResultNamespace = new SocketNamespace('/build-results');

/**
 * Gets the results of the given builds, send them back as a server event
 * @param socket {WebSocket}
 * @param request {{string: *}}
 */
var getResults = function (socket, request) {
    if (request['idList']) {
        async.map(
            request['idList'],
            submissionDao.getSubmissionData,
            function (err, results) {
                if (err) {
                    socket.emit('get results', {
                        error: err
                    });
                } else {
                    socket.emit('get results', {
                        results: results
                    });
                }
            }
        )
    }
};

BuildResultNamespace.addClientEvent('get results', getResults);

// This is what will be registered automagically with the SocketConnectionManager
exports.Namespace = BuildResultNamespace;