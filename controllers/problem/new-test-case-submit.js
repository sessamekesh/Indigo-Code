/**
 * Created by Kamaron on 8/22/2015.
 */

var getBaseData = require('./new-test-case').fill_data;
var PageErrorList = require('../../models/RegistrationPageErrorCollection');

var problemDao = require('../../dao/problem_dao');

var async = require('async');
var fs = require('fs');

exports.post = function (req, res) {
    // Get data from post
    var errorList = new PageErrorList();

    var tcInFile = req.files['test_input'];
    var tcExFile = req.files['test_expected'];

    if (!tcInFile) {
        errorList.addError('test_input', 'No test input file received!');
    }

    if (!tcExFile) {
        errorList.addError('test_expected', 'No test expected output file received!');
    }

    if (!req.body['comp_sys_name']) {
        errorList.addError('comp_sys_name', 'No comparisons system specified!');
    }

    var data = {
        title: 'Add Test Case',
        redirect_to: '/competition/' + req.comp_data.id + '/problem/' + req.problemData.id + '/new-test-case',
        pageErrors: errorList
    };

    // Errors have been checked, either send back error or accept
    if (errorList.isFatal()) {
        exports.fill_data(req, data, function (newData) {
            res.status(200).render('./problem/new-test-case', newData);
        });
    } else {
        // Add the test case, in background attempt validation

        // Create database entry for test case
        // Move files to appropriate location
        async.series({
            createDatabaseEntry: function (callback) {
                problemDao.createTestCase(
                    new problemDao.TestCaseData(
                        null,
                        req.problemData.id,
                        !!req.body['is_visible'],
                        req.body['comp_sys_name']
                    ), function (dberr, dbres) {
                        if (dberr) {
                            callback(dberr);
                        } else {
                            data.testCaseData = dbres;
                            callback(null, dbres);
                        }
                    }
                );
            },
            makeDirectory: function (callback) {
                fs.mkdir('./data/test-cases/' + data.testCaseData.id, callback);
            },
            moveInputFile: function (callback) {
                var inSource = fs.createReadStream(tcInFile.path);
                inSource.pipe(fs.createWriteStream('./data/test-cases/' + data.testCaseData.id + '/input.txt'));
                inSource.on('end', callback);
                inSource.on('error', callback);

                fs.unlink(tcInFile.path);
            },
            moveExpectedFile: function (callback) {
                var exSource = fs.createReadStream(tcExFile.path);
                exSource.pipe(fs.createWriteStream('./data/test-cases/' + data.testCaseData.id + '/expected.txt'));
                exSource.on('end', callback);
                exSource.on('error', callback);

                fs.unlink(tcExFile.path);
            }
        }, function(aserr) {
            if (aserr) {
                console.log('An error occurred storing the test case:', aserr.message);
                res.status(500).render('./error', {
                    message: aserr.message,
                    error: aserr
                });
            } else {
                exports.fill_data(req, data, function (newData) {
                    res.redirect('/competition/' + newData.comp_data.id + '/problem/' + newData.problemData.id + '/test-cases');
                });
            }
        });
    }
};

/**
 * @param req
 * @param data
 * @param cb {function (newData: object)}
 */
exports.fill_data = function (req, data, cb) {
    getBaseData(req, data, function (newData) {

        cb(newData);
    });
};