/**
 * Created by Kamaron on 7/12/2015.
 *
 * Maintains a registry of all attached BuildServers
 */

var config = require('../config').config;
var BuildResult = require('./models/BuildResult').BuildResult;
var RESULTS = require('./models/BuildResult').RESULTS;
var BuildRequest = require('./models/BuildRequest').BuildRequest;

var request = require('request');

var DELAY_BETWEEN_BUILD_ATTEMPTS = 500;

/**
 * @constructor
 */
var BuildServerManager = function () {
    /**
     * Map of all registered build servers, with their UUIDs
     * @type {{ String: BuildServer }}
     * @private
     */
    this._registeredBuildServers = {};

    /**
     * Map of build servers with which reconnects are being attempted,
     *  with the key being the server UUID and the value being the
     *  number of elapsed reconnect attempts
     * @type {{ String: Number }}
     * @private
     */
    this._reconnectAttempts = {};

    /**
     * @type {Array.<BuildRequest>}
     */
    this.buildQueue = [];
};

/**
 * Register a new build server to this system
 * @param buildServer {BuildServer} An already loaded build server, needing to be added
 * @param cb {function (err: Error|null)} Callback with error, if an error occurred
 */
BuildServerManager.prototype.registerBuildServer = function (buildServer, cb) {
    var me = this;
    if (buildServer.connected) {
        buildServer.getServerData(function (err, serverData) {
            // This should pretty much always succeed, but why not check?
            if (err) {
                cb (err);
            } else {
                if (me._registeredBuildServers[serverData.serverUUID]) {
                    cb(new Error('ID ' + serverData.serverUUID + ' already taken!'));
                } else {
                    me._registeredBuildServers[serverData.serverUUID] = buildServer;
                    cb(null);
                    setTimeout(function () {
                        me._checkBuildServer(serverData.serverUUID);
                    }, config.buildServerUpdateTimeout);
                }
            }
        });
    } else {
        cb (new Error ('Build server is not connected - cannot register to build server management system!'));
    }
};

/**
 * @param id {String} ID of the build server to check
 * @private
 */
BuildServerManager.prototype._checkBuildServer = function (id) {
    var me = this;
    if (this._registeredBuildServers[id]) {
        this._registeredBuildServers[id].ping(function (err) {
            if (err) {
                // Something wrong happened, attempt reconnect?
                me._reconnectAttempts[id] = (me._reconnectAttempts[id] || 0) + 1;
                if (me._reconnectAttempts[id] > config.buildServerReconnectAttempts) {
                    delete me._reconnectAttempts[id];
                    delete me._registeredBuildServers[id];
                } else {
                    setTimeout(function () {
                        me._checkBuildServer(id);
                    }, config.buildServerUpdateTimeout);
                }
            } else {
                me._reconnectAttempts[id] && delete me._reconnectAttempts[id];
                setTimeout(function () {
                    me._checkBuildServer(id);
                }, config.buildServerUpdateTimeout);
            }
        });
    }
};

/**
 * @param id {String} ID of the requested build server
 * @return {BuildServer|null}
 */
BuildServerManager.prototype.getBuildServer = function(id) {
    return this._registeredBuildServers[id] || null;
};

/**
 * @param id {String}
 */
BuildServerManager.prototype.removeBuildServer = function (id) {
    this._registeredBuildServers[id] && delete this._registeredBuildServers[id];
    this._reconnectAttempts[id] && delete this._reconnectAttempts[id];
};

/**
 * TODO KAM: For performance, you really should just keep an array of keys...
 * @return {Array.<BuildServer>}
 */
BuildServerManager.prototype.getBuildServerList = function () {
    var tr = [];
    for (var id in this._registeredBuildServers) {
        if (this._registeredBuildServers.hasOwnProperty(id)) {
            tr.push(this._registeredBuildServers[id]);
        }
    }
    return tr;
};

/**
 * Identify which attached BuildServers can perform the given bulid
 * @param br {BuildRequest}
 * @param callback {function (err: Error=, buildServers: Array.<BuildServer>=)}
 */
BuildServerManager.prototype.enumerateValidBuildServers = function (br, callback) {
    /** @type {Array.<BuildServer>} */
    var validServers = [];
    for (var buildServer in this._registeredBuildServers) {
        if (this._registeredBuildServers.hasOwnProperty(buildServer) && this._registeredBuildServers[buildServer].getBuildSystemSync(br.buildSystem.id)) {
            validServers.push(this._registeredBuildServers[buildServer]);
        }
    }

    // Now, limit the valid servers by which ones contain all of the required comparison systems
    validServers = validServers.filter(function (server) {
        var isValid = true;
        for (var i = 0; i < br.comparisonSystemList.length; i++) {
            if (!server.getComparisonSystemSync(br.comparisonSystemList[i].id)) {
                isValid = false;
            }
        }

        return isValid;
    });

    callback(null, validServers);
};

/**
 * Request to perform a build, invoking the given callbacks when the build is sent or received to/from the build server
 *  the onSend method may optionally send an error. Both onSend and onResultReceived will always be invoked!
 * @param br {BuildPackage} A build request to perform
 * @param onSend {function (err: Error=)} Invoked when the package is sent to the build server
 * @param onResultReceived {function (err: Error=, result: BuildResult=)} Invoked when the response is received
 */
BuildServerManager.prototype.requestBuild = function (br, onSend, onResultReceived) {

    var me = this;

    // Build the package
    if (br.buildPackageLocation) {
        finishSuccessfully();
    } else {
        br.buildPackage(function (be, packageLocation) {
            if (be) {
                console.log('Error building package:', be.message);
                onSend(be);
                onResultReceived(be, new BuildResult(
                    RESULTS.INTERNAL_SERVER_ERROR, 'Could not build package', {}
                ));
            } else {
                finishSuccessfully();
            }
        });
    }

    function finishSuccessfully() {
        // Build package is ready to queue, make a BuildRequest object from it and go
        var buildRequest = new BuildRequest(
            br.buildSystem,
            br.comparisonSystems,
            br.buildPackageLocation,
            onSend,
            onResultReceived
        );

        me.buildQueue.push(buildRequest);

        // One build request in, one build request attempt to be reported
        me.attemptOneBuild();
    }
};

/**
 * Invoke to attempt to perform a build.
 * Continue to invoke until all builds have been performed.
 */
BuildServerManager.prototype.attemptOneBuild = function () {
    var me = this;

    if (this.buildQueue.length === 0) {
        return;
    }

    var buildRequest = this.buildQueue.shift();

    if (buildRequest.buildPerformed) {
        return;
    }

    if (buildRequest.requestSent) {
        this.buildQueue.push(buildRequest);
        return;
    }

    this.enumerateValidBuildServers(buildRequest, function (err, buildServers) {
        if (err) {
            console.log('Error enumerating build servers for', buildRequest.packageFileLocation, ':', err.message);
            buildRequest.onSend(err);
            buildRequest.onReceiveResult(err, new BuildResult(
                RESULTS.INTERNAL_SERVER_ERROR,
                'Could not enumerate valid build servers',
                {}
            ));
        } else if (buildServers.length === 0) {
            console.log('No valid build server available for', buildRequest.packageFileLocation);
            buildRequest.onSend(
                new Error('No valid build server available')
            );
            buildRequest.onReceiveResult(new Error('No valid build server available'), new BuildResult(
                RESULTS.INTERNAL_SERVER_ERROR,
                'No build server can perform your build - notify admin and try again',
                {}
            ));
        } else {
            for (var buildServer in buildServers) {
                if (buildServers.hasOwnProperty(buildServer)) {
                    buildServers[buildServer].performBuild(
                        buildRequest,
                        function (pberr, buildResultsURI) {
                            if (pberr) {
                                console.log('Failed to request build:', pberr.message);
                                me.buildQueue.push(buildRequest);
                                buildRequest.requestSent = false;
                                setTimeout(me.attemptOneBuild.bind(me), DELAY_BETWEEN_BUILD_ATTEMPTS);
                            } else {
                                console.log('Build request success! Results location:', buildResultsURI);
                                buildRequest.onSend();

                                // TODO KAM: Remove this pointless spinning, there's obviously some race
                                //  condition somewhere
                                var tehnow = Date.now();
                                while (Date.now() < (tehnow + 1000)) {}
                                request({
                                    method: 'GET',
                                    uri: buildResultsURI
                                }, function (resErr, resResponse, resBody) {
                                    if (resErr) {
                                        console.log('Error fetching result of build', buildResultsURI, ':', resErr.message);
                                        // TODO KAM: Perhaps try again?
                                    } else {
                                        buildRequest.buildPerformed = true;
                                        console.log(resBody);
                                        if (resResponse.statusCode === 404) {
                                            console.log('Build with given ID not found!', buildResultsURI, resBody);
                                            buildRequest.onReceiveResult(
                                                new Error('Build with given ID not found! Check logs'),
                                                new BuildResult(
                                                    RESULTS.INTERNAL_SERVER_ERROR,
                                                    'Build with given ID not found! Notify admin',
                                                    {}
                                                )
                                            );
                                        } else if (resResponse.statusCode === 500) {
                                            console.log('Unknown error on build server while obtaining data!', resBody);
                                            buildRequest.onReceiveResult(
                                                new Error('Obtaining build result on build server failed!'),
                                                new BuildResult(
                                                    RESULTS.INTERNAL_SERVER_ERROR,
                                                    'Obtaining build result on build server failed! Notify admin',
                                                    {}
                                                )
                                            );
                                        } else if (resResponse.statusCode === 200) {
                                            var successfulResponse = JSON.parse(resBody);
                                            buildRequest.onReceiveResult(
                                                null,
                                                new BuildResult(
                                                    successfulResponse['resultCode'],
                                                    successfulResponse['notes'],
                                                    successfulResponse['optionalParams']
                                                )
                                            );
                                        } else {
                                            console.log('Something seriously wrong happened in retrieving results for build', buildResultsURI, resBody, resResponse.statusCode);
                                            buildRequest.onReceiveResult(
                                                new Error('Something seriously wrong happened in retrieving results for build'),
                                                new BuildResult(
                                                    RESULTS.INTERNAL_SERVER_ERROR,
                                                    'Something seriously wrong happened, notify an admin',
                                                    {}
                                                )
                                            );
                                        }
                                    }
                                });
                            }
                        }
                    );
                    buildRequest.requestSent = true;
                }
            }
        }
    });
};

/**
 * @type {BuildServerManager}
 */
exports.BuildServerManager = new BuildServerManager();