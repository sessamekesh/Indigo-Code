/**
 * Created by kamaron on 9/1/15.
 */

var getBaseData = require('./index').fill_data;
var PageErrorList = require('../../models/RegistrationPageErrorCollection');
var problemDao = require('../../dao/problem_dao');
var async = require('async');
var fs = require('fs');

/**
 * @type {BuildServerManager}
 */
var BuildManager;

/**
 * @param req {object}
 * @param data {object}
 * @param cb {function (newData: object)}
 */
exports.fill_data = function (req, data, cb) {
    data = data || {};

    data.pageErrors = data.pageErrors || new PageErrorList();

    getBaseData(req, data, function (newData) {
        newData.buildSystems = {};
        BuildManager.getBuildServerList().forEach(function (buildServer) {
            buildServer.getCachedBuildSystems().forEach(function (buildSystem) {
                newData.buildSystems[buildSystem.id] = buildSystem.name;
            });
        });

        cb(newData);
    });
};

exports.get = function (req, res) {
    // Only allow user if admin!
    if (req['user_data']['is_admin'] === true) {
        exports.fill_data(req, {
            title: 'Add Sample Solution',
            redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/new-sample-solution'
        }, function (newData) {
            res.status(200).render('./problem/new-sample-solution', newData);
        });
    } else {
        res.status(401).render('./error', { err: new Error('Must be administrator to view this page!'), message: 'Must be administrator to view this page!' });
    }
};

exports.post = function (req, res) {
    // Get data from post
    var errorList = new PageErrorList();

    var solnFile = req['files']['sample_solution_source'];

    if (!solnFile) {
        errorList.addError('sample_solution_source', 'No solution file found!');
    }

    if (!req['body']['build_system_name']) {
        errorList.addError('build_system_name', 'No build system specified!');
    }

    var data = {
        title: 'Add Sample Solution',
        redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/new-sample-solution',
        pageErrors: errorList
    };

    // Errors have been checked, either send back error or accept
    if (errorList.isFatal()) {
        exports.fill_data(req, data, function (newData) {
            res.status(400).render('./problem/new-sample-solution', newData);
        });
    } else {
        // Add the sample solution, in background attempt validation

        // Create database entry for sample solution
        // Move files to appropriate location
        async.series({
            createDatabaseEntry: function (callback) {
                problemDao.createSampleSolution(
                    new problemDao.SampleSolutionData(
                        null,
                        req['problemData']['id'],
                        req['body']['build_system_name'],
                        solnFile.originalname
                    ), function (dberr, dbres) {
                        data['sampleSolutionData'] = dbres;
                        callback(dberr, dbres);
                    }
                )
            },
            makeDirectory: function (callback) {
                fs.mkdir('./data/sample-solutions/' + data['sampleSolutionData']['id'], callback);
            },
            moveSourceFile: function (callback) {
                var solutionSource = fs.createReadStream(solnFile.path);
                solutionSource.pipe(fs.createWriteStream('./data/sample-solutions/' + data['sampleSolutionData']['id'] + '/source'));
                solutionSource.on('end', callback);
                solutionSource.on('error', callback);

                fs.unlink(solnFile.path);
            } // TODO: attemptValidation: function (callback)
        }, function (aserr) {
            if (aserr) {
                console.log('An error occurred storing the sample solution:', aserr.message);
                res.status(500).render('./error', {
                    message: aserr.message,
                    error: aserr
                });
            } else {
                exports.fill_data(req, data, function (newData) {
                    res.redirect('/competition/' + newData.comp_data.id + '/problem/' + newData.problemData.id + '/sample-solutions');
                });
            }
        })
    }
};

BuildManager = require('../../buildServerManager/BuildServerManager').BuildServerManager;