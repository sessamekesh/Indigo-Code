/**
 * Created by kamaron on 9/8/15.
 */

var fs = require('fs');

var getBaseData = require('./index').fill_data;

var submissionDao = require('../../dao/submission_dao');
var problemDao = require('../../dao/problem_dao');
var BuildPackage = require('../../buildServerManager/models/BuildPackage').BuildPackage;
var BuildServerManager = require('../../buildServerManager/BuildServerManager').BuildServerManager;
var PageError = require('../../models/RegistrationPageErrorCollection');
var resultsSocket = require('../../websockets/routes/build-result').Namespace;

exports.get = function (req, res) {
    exports.fill_data(req, {
        title: 'Submit Solution'
    }, function (newData) {
        res.render('./problem/submit', newData);
    });
};

exports.post = function (req, res) {
    exports.fill_data(req, {
        title: 'Submit Solution'
    }, function (newData) {
        var bp;

        // Check for data validity
        // -Valid build system ID
        if (!req.body['build_system_id']) {
            newData['pageErrors'].addError('build_system_id', 'No valid build system ID provided!');
        }

        // -File upload
        if (!req.files['source_code']) {
            newData['pageErrors'].addError('source_code', 'Source code not uploaded!');
        }

        // If invalid, send back with errors
        if (newData['pageErrors'].isFatal()) {
            res.render('./problem/submit', newData);
        } else {
            //  Move submission
            submissionDao.createSubmission(
                new submissionDao.SubmissionData(
                    null,
                    req['team_data']['id'],
                    req['problemData']['id'],
                    req.body['build_system_id'],
                    '',
                    (new Date()).getTime(),
                    '',
                    true
                ), function (cserr, csres) {
                    if (cserr) {
                        console.log('Could not create submission:', cserr.message);
                        res.render('./error', {
                            error: new Error('Could not create submission'),
                            message: 'Could not create submission'
                        });
                    } else {
                        var sourceIn = fs.createReadStream(req.files['source_code'].path);
                        sourceIn.pipe(fs.createWriteStream('./data/source-code/' + csres.id));
                        sourceIn.on('end', function () {
                            problemDao.getAttachedTestCases(req['problemData']['id'], function (aterr, atres) {
                                if (aterr) {
                                    console.log('Could not get test cases for new submission', csres.id, ':', aterr.message);
                                    res.render('./error', {
                                        error: new Error('Could not create submission'),
                                        message: 'Could not create submission'
                                    });
                                } else {
                                    var comparisonSystems = atres.map(function (at) {
                                        return at['comparisonSystemName'];
                                    });
                                    var originalFilename = req.files['source_code'].filename;
                                    problemDao.getTimeLimit(
                                        req['problemData']['id'],
                                        req.body['build_system_id'],
                                        function (tlerr, tlres) {
                                            if (tlerr) {
                                                console.log('Could not get time limit for problem', req['problemData']['id'], 'and language', req.body['build_system_id'], ':', tlerr.message);
                                                res.render('./error', {
                                                    error: new Error('Could not create submission'),
                                                    message: 'Could not create submission'
                                                });
                                            } else {
                                                bp = new BuildPackage(
                                                    csres.id,
                                                    req.body['build_system_id'],
                                                    comparisonSystems,
                                                    originalFilename,
                                                    atres,
                                                    tlres,
                                                    './data/source-code/' + csres.id
                                                );

                                                // Build le build!
                                                BuildServerManager.requestBuild(
                                                    bp,
                                                    function (onSendError) {
                                                        if (onSendError) {
                                                            console.log('Error sending request:', onSendError.message);
                                                        }
                                                    },
                                                    function (onResultReceivedError, buildResult) {
                                                        if (onResultReceivedError) {
                                                            console.log('Error on receive result:', onResultReceivedError.message);
                                                        }

                                                        resultsSocket.fireServerEvent('get results', {
                                                            results: [{
                                                                id: buildResult['id'],
                                                                result: buildResult['result'],
                                                                notes: buildResult['notes'],
                                                                optionalParams: buildResult['optionalParams']
                                                            }]
                                                        });
                                                    }
                                                );
                                                res.redirect('/competition/' + req['comp_data']['id'] + '/problem/' + req['problemData']['id'] + '/submissions');
                                            }
                                        }
                                    );
                                }
                            });
                        });
                        sourceIn.on('error', function (cperr) {
                            console.log('Error moving file from upload directory to source directory:', cperr.message);
                            res.render('./error', {
                                error: new Error('Could not create submission'),
                                message: 'Could not create submission'
                            });
                        });
                    }
                }
            );
        }
    });
};

/**
 * @param req
 * @param data
 * @param callback {function (newData: Object)}
 */
exports.fill_data = function (req, data, callback) {
    getBaseData(req, data || {}, function (newData) {
        newData.buildSystems = {};
        newData.pageErrors = newData.pageErrors || new PageError();
        BuildServerManager.getBuildServerList().forEach(function (element) {
            element.getCachedBuildSystems().forEach(function (element2) {
                newData.buildSystems[element2.id] = element2.name;
            });
        });
        callback(newData);
    });
};