/**
 * Created by kamaron on 9/1/15.
 *
 * Performs validation on the problem.
 */

// TODO KAM: You should create an accept header switch, so this provides JSON data if called somewhere requiring such

var getBaseData = require('./index').fill_data;
var problemDao = require('../../dao/problem_dao');
var submissionDao = require('../../dao/submission_dao');
var async = require('async');
var BuildPackage = require('../../buildServerManager/models/BuildPackage').BuildPackage;
var BuildServerManager = require('../../buildServerManager/BuildServerManager').BuildServerManager;

var BuildResultsSocket = require('../../websockets/routes/build-result').Namespace;

/**
 * Fill in data required for this page (and any page that builds on this page)
 * @param req Request object
 * @param data {object} Existing data
 * @param cb {function (newData : Object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    getBaseData(req, data, cb);
};

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Validation for problem ' + req['problemData']['name'],
        redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/validate'
    }, function (newData) {

        // Get sample solutions to test

        // For general use with the problem, get
        // -Which test cases are needed
        // -What comparisons systems are needed (from test cases)

        problemDao.getAttachedTestCases(req['problemData']['id'], function (tcerr, tcres) {
            if (tcerr) {
                res.status(500).render('./error', {
                    error: tcerr,
                    message: tcerr.message
                });
            } else {
                newData.testCases = tcres;
                var compareSystemsNeeded = tcres.map(function (tc) {
                    return tc['comparisonSystemName'];
                });
                var testCases = tcres;

                newData.buildList = [];

                newData.include_scripts = newData.include_scripts || [];
                newData.include_stylesheets = newData.include_stylesheets || [];

                newData.include_scripts.push('https://cdn.socket.io/socket.io-1.3.5.js');
                newData.include_scripts.push('/js/build-results-listener.js');
                newData.include_scripts.push('/jquery-ui/jquery-ui.js');
                newData.include_stylesheets.push('/jquery-ui/jquery-ui.css');

                // For each sample solution, build a packaging request object with...
                // -Submission ID (create submission)
                // -Which build system to use
                // -What the time limit on said build system is
                // -The source location (in data/sample-solutions)
                // -The original filename
                problemDao.getAttachedSampleSolutions(req['problemData']['id'], function (sserr, ssres) {
                    if (sserr) {
                        res.status(500).render('./error', {
                            error: sserr,
                            message: sserr.message
                        });
                    } else {
                        async.map(ssres, function (item, callback) {
                            async.series([
                                // 0: Create submission, get submission ID, get build system to use
                                function (callback) {
                                    submissionDao.createSubmission(new submissionDao.SubmissionData(
                                            null,
                                            req['team_data']['id'],
                                            req['problemData']['id'],
                                            item.languageId,
                                            '',
                                            (new Date()).getTime(),
                                            '',
                                            false
                                        )
                                    , callback);
                                }
                                // 1: Get the time limit for the given build system
                                , function (callback) {
                                    problemDao.getTimeLimit(req['problemData']['id'], item.languageId, callback);
                                }
                                // 2: Get the source location and original filename
                                , function (callback) {
                                    callback(null, {
                                        sourceLocation: './data/sample-solutions/' + item.id + '/source',
                                        originalName: item.originalFilename
                                    });
                                }
                                // 3: Get the ID of the sample solution
                                , function (callback) {
                                    callback(null, item.id);
                                }
                            ], callback);
                        }, function (err, results) {
                            if (err) {
                                res.status(500).render('./error', {
                                    error: err,
                                    message: err.message
                                });
                            } else {
                                // Now our results are all stored, create build requests for each one
                                /**
                                 * @type {Array.<BuildPackage>}
                                 */
                                var buildRequests = results.map(function (item) {
                                        return new BuildPackage(
                                            item[0].id,
                                            item[0].languageId,
                                            compareSystemsNeeded,
                                            item[2].originalName,
                                            testCases,
                                            item[1],
                                            item[2].sourceLocation
                                        )
                                    }
                                );

                                var nValidBuilds = 0;
                                for (var i = 0; i < buildRequests.length; i++) {

                                    // Report this to the newData for use in the page
                                    newData.buildList.push({
                                        sampleSolutionID: results[i][3],
                                        submissionID: buildRequests[i].id
                                    });

                                    (function (idx) {
                                        BuildServerManager.requestBuild(
                                            buildRequests[i],
                                            function (onSendError) { // On sent to build server
                                                // TODO: Notify, via WebSocket, that the request is sent
                                                console.log('Request was sent to a build server', JSON.stringify(onSendError));
                                            },
                                            function (onResultError, result) { // On receive result
                                                if (result) {
                                                    submissionDao.updateSubmission(
                                                        results[idx][0].id,
                                                        result['result'],
                                                        result['notes'],
                                                        null,
                                                        function (userr) {
                                                            if (userr) {
                                                                console.log('Error updating submission:', userr.message);
                                                            } else {
                                                                BuildResultsSocket.fireServerEvent('get results', {
                                                                    results: [{
                                                                        id: results[idx][0].id,
                                                                        result: result['result'],
                                                                        notes: result['notes'],
                                                                        optionalParams: result['optionalParams']
                                                                    }]
                                                                });
                                                                if (result['result'] === 'AC') {
                                                                    nValidBuilds++;
                                                                }

                                                                if (idx === buildRequests.length - 1) {
                                                                    console.log('Problem', req['problemData']['id'], 'set to validity', nValidBuilds === buildRequests.length);
                                                                    problemDao.setProblemValidity(req['problemData']['id'], nValidBuilds === buildRequests.length, function (pverr) {
                                                                        if (pverr) {
                                                                            console.log('Error setting validity of problem:', pverr.message);
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    );
                                                    console.log('Result Received!', JSON.stringify(result), JSON.stringify(onResultError));
                                                } else {
                                                    // An error must have happened.
                                                    console.log('An error must have happened', JSON.stringify(onResultError));
                                                }
                                            }
                                        );
                                    })(i);
                                }

                                res.status(200).render('./problem/validate.jade', newData);
                            }
                        });
                    }
                });
            }
        });
    });
};