/**
 * Created by kamaron on 11/21/15.
 *
 * WebSocket connections for handling scoreboard updates
 */

var async = require('async');

var SocketNamespace = require('../models/SocketNamespace').SocketNamespace;
var SocketManager = require('../SocketConnectionManager').SocketManager;
var userDao = require('../../dao/user_dao');
var compDao = require('../../dao/competition_dao');
var probDao = require('../../dao/problem_dao');

var ScoreboardRenderData = require('../models/ScoreboardRenderData').ScoreboardRenderData;
var ProblemSolvedRenderData = require('../models/ScoreboardRenderData').ProblemSolvedRenderData;

// For every competition, make a WebSocket connection
// TODO KAM: Swap this out for only ONGOING competitions (save resources)

/**
 * @type {Array.<SocketNamespace>}
 */
var ScoreboardNamespaces = [];

compDao.getAllCompetitions(function (gacerr, gacres) {
    if (gacerr) {
        console.log('-------------------------------------');
        console.log('----------- CRITICAL ERROR ----------');
        console.log('---- websockets/routes/scoreboard.js-');
        console.log('Could not get list of all competitions!');
        console.log('Scoreboard WILL NOT WORK.');
        console.log('-------------------------------------');
    } else {
        for (var i = 0; i < gacres.length; ++i) {
            var newSocket = new SocketNamespace('/scoreboard/' + gacres[i].id);
            ScoreboardNamespaces.push(newSocket);
            initSocket(newSocket, gacres[i].id);
        }
    }
});

/**
 * Initialize a socket namespace to listen on all the appropriate channels
 * @param socketNamespace {SocketNamespace}
 * @param compID {number}
 */
function initSocket(socketNamespace, compID) {
    socketNamespace.addClientEvent('request scores', function (socket, request) {
        // Get list of results, send back to requesting socket.
        userDao.getTeamsInCompetition(compID, function (dberr, dbres) {
            if (dberr) {
                console.log('Error teams for competition', compID, ':', dberr);
                socket.emit('error', {
                    'error': 'Could not read team scores from database.'
                });
            } else {
                // Get which problem each team has solved...
                async.map(
                    dbres,
                    function (row, cb) {
                        probDao.getProblemsSolvedByTeam(
                            row.id, compID,
                            function (probsErr, probsRes) {
                                if (probsErr) {
                                    cb(probsErr);
                                } else {
                                    cb(null, new ScoreboardRenderData(
                                        row.id,
                                        row.team_name,
                                        row.team_tagline,
                                        row.score,
                                        row.time_penalty,
                                        probsRes.map(function (probRow) {
                                            return new ProblemSolvedRenderData(
                                                probRow['name'],
                                                probRow['solved']
                                            );
                                        })
                                    ));
                                }
                            }
                        );
                    },
                    function (mapError, mapResult) {
                        if (mapError) {
                            console.log('Error mapping results:', mapError);
                            socket.emit('error', {
                                'error': 'Could not read team scores from database. Error in mapping problem set.'
                            });
                        } else {
                            socket.emit('update scores', {
                                scoresList: mapResult
                            });
                        }
                    }
                );
            }
        });
    });

    SocketManager.registerNamespace(socketNamespace);
}