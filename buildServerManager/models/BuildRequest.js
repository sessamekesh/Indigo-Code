/**
 * Created by Kamaron on 8/22/2015.
 */

var BuildSystem = require('./BuildSystemData').BuildSystemData;
var ComparisonSystem = require('./ComparisonSystem').ComparisonSystem;
var TestCaseData = require('../../dao/problem_dao').TestCaseData;
var BuildServer = require('./BuildServer').BuildServer;
var BuildManager = require('../BuildServerManager').BuildServerManager;

var tar = require('tar-fs');
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');

/**
 * Represents the data required to perform a build, and contains methods to package that data and expose it in
 *  a way that will be required to send it to the build server. It also provides methods to determine if the
 *  build is possible, under the current configurations
 * @param submissionId {number} ID of the submission in the database (required to be unique)
 * @param buildSystem {string} The ID of the build system required
 * @param comparisonSystems {Array.<string>} The IDs of the comparison systems required
 * @param originalFilename {string} The original file name of the submission (required for Java, Java is the worst)
 * @param testCases {Array.<TestCaseData>} List of test cases to run
 * @param timeLimit {number} Time limit per test case
 * @param sourceLocation {string} Path of the submitted source code
 * @constructor
 */
var BuildRequest = function (submissionId, buildSystem, comparisonSystems, originalFilename, testCases, timeLimit, sourceLocation) {

    /**
     * @type {number}
     */
    this.id = submissionId;

    /**
     * @type {string}
     * @private
     */
    this._buildSystemName = buildSystem;

    /**
     * @type {BuildSystem|null}
     */
    this.buildSystem = null;

    /**
     * @type {Array.<string>}
     * @private
     */
    this._comparisonSystemNames = comparisonSystems;

    /**
     * @type {Array.<ComparisonSystem>|null}
     */
    this.comparisonSystems = null;

    /**
     * @type {Array.<BuildServer>}
     */
    this.buildServers = [];

    /**
     * @type {string}
     */
    this.originalFilename = originalFilename;

    /**
     * @type {Array.<TestCaseData>}
     */
    this.testCases = testCases;

    /**
     * @type {number}
     */
    this.timeLimit = timeLimit;

    /**
     * @type {string}
     */
    this.sourceLocation = sourceLocation;

    /**
     * @type {string|null}
     */
    this.buildPackageLocation = null;
};

/**
 * Determine if the build can be performed or not
 * @param result_callback {function (err: Error=, result: boolean=)}
 */
BuildRequest.prototype.validate = function (result_callback) {
    // Find all build servers that support the specified build system
    // Of those servers, use only the ones that support all of the comparison systems required
    // Gather data from one of the build servers about the build system and comparison systems
    // Store the possible build servers in our list

    async.series({
        findBuildServers: function (cb) {
            this.buildServers = [];
            BuildManager.getBuildServerList().forEach(function (element) {
                if (
                    !!element.getBuildSystemSync(this._buildSystemName) &&
                        this._comparisonSystemNames.every(function (ele) {
                            return !!element.getComparisonSystemSync(ele);
                        }.bind(this))
                ) {
                    this.buildServers.push(element);
                }
            }.bind(this));

            if (this.buildServers.length === 0) {
                cb(new Error('No build server attached that matches the provided constraints'));
            } else {
                cb(null, true);
            }
        }.bind(this),
        getBuildData: function (cb) {
            this.buildSystem = this.buildServers[0].getBuildSystemSync(this._buildSystemName);
            cb(null, true);
        }.bind(this),
        getComparisonSystemData: function (cb) {
            this.comparisonSystems = [];

            for (var i = 0; i < this._comparisonSystemNames.length; i++) {
                this.comparisonSystems.push(this.buildServers[0].getComparisonSystemSync(this._comparisonSystemNames[i]));
            }

            cb(null, true);
        }.bind(this),
        validateTestCasesExist: function (cb) {
            // Go through each test case, and make sure that the required files exist
            //  The required files are /data/test-cases/[ID]/input.txt and .../expected.txt

            async.every(this.testCases.map(function (tc) {
                return './data/test-cases/' + tc.id + '/input.txt';
            }).concat(this.testCases.map(function (tc) {
                return './data/test-cases/' + tc.id + '/expected.txt';
            })),
                function (item, cb) {
                    fs.lstat(item, function (lstatErr, lstatRes) {
                        if (lstatErr) {
                            console.log('Error validating test case ' + item.id + ' exists: ', lstatErr.message);
                        }
                        cb(!lstatErr && lstatRes && lstatRes.isFile());
                    });
                }.bind(this),
                function (result) {
                    if (result) {
                        cb(true);
                    } else {
                        console.log('Not all required test case data was found!');
                        cb(false);
                    }
                }
            );
        }.bind(this),
        validateDumbThings: function (cb) {
            if (!this.originalFilename) {
                console.log('No original filename provided!');
                cb(false);
            } else if (!this.sourceLocation) {
                console.log('No source location name provided!');
                cb(false);
            } else if (isNaN(this.timeLimit)) {
                console.log('Non-numeric time limit given!');
                cb(false);
            } else {
                cb(true);
            }
        }.bind(this),
        validateSourceExists: function (cb) {
            fs.lstat(this.sourceLocation, function (lstatErr, lstatRes) {
                if (lstatErr) {
                    console.log('Error validating source exists: ', lstatErr.message);
                }
                cb(!lstatErr && lstatRes && lstatRes.isFile());
            });
        }.bind(this)
    }, function (err) {
        if (err) {
            console.log(err.message);
        }

        result_callback(null, !!err);
    });
};

/**
 * Builds the package for this build request, and sends it to a staging area.
 *  Notifies caller (via callback) of location of package in staging area
 * @param callback {function (err: Error=, res: string=)}
 */
BuildRequest.prototype.buildPackage = function (callback) {
    this.validate(function (err, res) {
        if (err || !res) {
            cb(new Error('Package did not validate - ' + (err && err.message) || 'reason not provided (check logs?)'));
        } else {
            // Perform the packaging operation...
            async.series({
                createStageDirectory: function (cb) {
                    fs.mkdir('./data/build-packages/' + this.id, cb);
                }.bind(this),
                createMetadataFile: function (cb) {

                    var metadata = {
                        'original_filename': this.originalFilename,
                        'time_limit': this.timeLimit,
                        'test_cases': this.testCases.map(function (tc) {
                            return {
                                'id': tc.id,
                                'comparisonSystemName': tc['comparisonSystemName'],
                                'exposeData': tc['isVisibleDuringCompetition']
                            };
                        })
                    };

                    fs.writeFile('./data/build-packages/' + this.id + '/info.json',
                        JSON.stringify(metadata),
                        cb
                    );
                }.bind(this),
                moveSourceFile: function (cb) {
                    // lol sourceSource that's a silly name
                    var sourceSource = fs.createReadStream(this.sourceLocation);
                    var sourceDest = fs.createWriteStream('./data/build-packages/' + this.id + '/source');

                    sourceSource.pipe(sourceDest);
                    sourceSource.on('end', cb);
                    sourceSource.on('error', cb);
                }.bind(this),
                createTestCasesDirectory: function (cb) {
                    fs.mkdir('./data/build-packages/' + this.id + '/test-cases', cb);
                }.bind(this),
                moveTestCases: function (cb) {
                    async.every(
                        this.testCases,
                        function (element, eleCb) {
                            // Move the test case 'element'
                            var tcIn = fs.createReadStream('./data/test-cases/' + element.id + '/input.txt');
                            var tcInDest = fs.createWriteStream('./data/build-packages/' + this.id + '/test-cases/' + element.id + '.in');
                            tcIn.pipe(tcInDest);
                            tcIn.on('error', function (err) {
                                console.log('Error moving test case ' + element.id + ': ' + err.message);
                                eleCb(false);
                            });
                            tcIn.on('end', function () {
                                var tcExpected = fs.createReadStream('./data/test-cases/' + element.id + '/expected.txt');
                                var tcExpectedDest = fs.createWriteStream('./data/build-packages/' + this.id + '/test-cases/' + element.id + '.out');
                                tcExpected.pipe(tcExpectedDest);
                                tcExpected.on('error', function (err) {
                                    console.log('Error moving test case ' + element.id + ': ' + err.message);
                                    eleCb(false);
                                });
                                tcExpected.on('end', function () { eleCb(true) });
                            }.bind(this));
                        }.bind(this),
                        function (result) {
                            if (result) {
                                cb(null, true);
                            } else {
                                cb(new Error('Could not move all test cases - check logs for error'));
                            }
                        }
                    )
                }.bind(this),
                makePackage: function (cb) {
                    var tarStream = tar.pack('./data/build-packages/' + this.id);
                    var outStream = fs.createWriteStream('./data/build-packages/' + this.id + '.tar');
                    tarStream.pipe(outStream);

                    tarStream.on('end', function () {
                        this.buildPackageLocation = './data/build-packages/' + this.id + '.tar';
                        cb();
                    }.bind(this));
                    tarStream.on('error', function (err) {
                        console.log('Error packaging submission: ' + err.message);
                        cb(err);
                    });
                }.bind(this)

            }, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, this.buildPackageLocation);
                }

                // In any case, destroy the staging directory
                rimraf('./data/build-packages/' + this.id, function (err) {
                    if (err) {
                        console.log('Error destroying staging directory for build package ' + this.id, err.message);
                    }
                }.bind(this));
            }.bind(this));
        }
    }.bind(this));
};

exports.BuildRequest = BuildRequest;