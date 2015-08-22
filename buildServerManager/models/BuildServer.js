/**
 * Created by Kamaron on 7/11/2015.
 *
 * Represents a build server, connects to it and may ping it to check its status
 */

var rest = require('restler');

var BuildSystemData;
var ServerData;
var BuildConstraints;
var BuildServerStatus;

/**
 * Establish a connection with a build server, via Indigo Code Buildserver v0.1 standard
 * @param hostname {String} Hostname of build server
 * @param port {Number} Port of build server
 * @param apiVersion {Number} Major version of the API (1, 2, 3...)
 * @param cb {function(err: Error|null)} Callback - provides an error on unsuccessful connection
 * @constructor
 */
var BuildServer = function (hostname, port, apiVersion, cb) {
    /**
     * @type {String}
     * @private
     */
    this._hostname = hostname;

    /**
     * @type {Number}
     * @private
     */
    this._port = port;

    /**
     * @type {string}
     * @private
     */
    this._apiRootPath = '/api/v' + apiVersion;

    /**
     * True if the system is currently connected, false otherwise
     * @type {boolean}
     */
    this.connected = false;

    /**
     * @type {ServerData|null}
     * @private
     */
    this._serverData = null;

    /**
     * @type {BuildServerStatus|null}
     * @private
     */
    this._serverStatus = null;

    /**
     * @type {Array.<BuildSystemData>|null}
     * @private
     */
    this._buildSystemCache = null;

    /**
     * @type {Array.<ComparisonSystem>|null}
     * @private
     */
    this._compareSystemCache = null;

    this.refresh(cb || function () {});
};

/**
 * Get the build server data.
 * CB will complete instantaneously if the server data has already been loaded
 * @param cb {function (err: Error|null, data: BuildSystemData=)}
 */
BuildServer.prototype.getServerData = function (cb) {
    if (this._serverData) {
        cb(null, this._serverData);
    } else {
        var me = this;
        rest.get('http://' + this._hostname + ':' + this._port + this._apiRootPath + '/server-data')
            .on('success', function (data) {
                try {
                    me._serverData = new ServerData(
                        data['productNamespace'],
                        data['version'],
                        data['serverName'],
                        data['serverUUID'],
                        new BuildConstraints(
                            data['buildConstraints']['maxConcurrentTests'],
                            data['buildConstraints']['queueSize'],
                            data['buildConstraints']['resultsAvailabilityTimeout']
                        ),
                        data['buildSystemsList'],
                        data['comparisonSystemsList']
                    );
                    me.connected = true;
                    cb(null, me._serverData);
                } catch (e) {
                    cb (e);
                }
            }).on('fail', function (data, response) {
                console.log('Fail!');
                console.log(data);
                console.log(response);
                me.connected = false;
                cb(new Error(JSON.stringify(data)));
            }).on('error', function (err, response) {
                console.log('Error!');
                console.log(err);
                console.log(response);
                me.connected = false;
                cb(err);
            }).on('timeout', function (ms) {
                console.log('Timeout!');
                console.log(ms);
                me.connected = false;
                cb(new Error('Request timed out'));
            }
        );
    }
};

/**
 * @param cb {function(err: Error|null, status: BuildServerStatus=)}
 * @constructor
 */
BuildServer.prototype.getBuildStatus = function (cb) {
    if (this._serverStatus) {
        cb(null, this._serverStatus);
    } else {
        var me = this;
        rest.get('http://' + this._hostname + ':' + this._port + this._apiRootPath + '/build-status')
            .on('success', function (data, response) {
                try {
                    // TODO KAM: Validate this better
                    me._serverStatus = new BuildServerStatus(
                        data['status'],
                        data['queued'],
                        data['executing']
                    );
                    cb(null, me._serverStatus);
                    me.connected = true;
                } catch (e) {
                    cb(e);
                }
            }).on('fail', function (data, response) {
                console.log('Fail!');
                console.log(data);
                console.log(response);
                me.connected = false;
                cb(new Error(JSON.stringify(data)));
            }).on('error', function (err, response) {
                console.log('Error!');
                console.log(err);
                console.log(response);
                me.connected = false;
                cb(err);
            }).on('timeout', function (ms) {
                console.log('Timeout!');
                console.log(ms);
                me.connected = false;
                cb(new Error('Connection timed out'));
            }
        );
    }
};

/**
 * Get a list of build systems that this build server supports
 * @param cb {function (err: Error|null, systems: Array.<BuildSystemData>=)}
 */
BuildServer.prototype.getBuildSystems = function (cb) {
    var me = this;

    if (this._buildSystemCache) {
        cb (null, this._buildSystemCache);
    } else {
        if (this._serverData) {
            this._serverData.buildSystem(function (err, systems) {
                if (systems) me._buildSystemCache = systems;
                cb (err, systems);
            });
        } else {
            this.refresh(function (err) {
                if (err) {
                    cb(err);
                } else {
                    if (this._serverData) {
                        this._serverData.buildSystem(function (bserr, systems) {
                            if (systems) me._buildSystemCache = systems;
                            cb (bserr, systems);
                        });
                    } else {
                        // This piece of code should never be reachable, but I haven't proved that yet, so I'm going to leave
                        //  it in anyways. If this is reached, it means that the this.refresh function returned a non-error
                        //  status, but somehow _serverData is still not set.
                        cb (new Error('Server data was unreachable, but an error was not returned. Contact an administrator, this is a problem.'));
                    }
                }
            });
        }
    }
};

/**
 * @return {Array.<BuildSystemData>|null}
 */
BuildServer.prototype.getCachedBuildSystems = function () {
    return this._buildSystemCache;
};

/**
 * Get a list of comparison systems that this build server supports
 * @param cb {function (err: Error|null, systems: Array.<ComparisonSystem>=)}
 */
BuildServer.prototype.getComparisonSystems = function (cb) {
    if (this._compareSystemCache) {
        cb(null, this._compareSystemCache);
    } else {
        var me = this;
        if (this._serverData) {
            this._serverData.comparisonSystems(function (err, systems) {
                if (systems) me._compareSystemCache = systems;
                cb (err, systems);
            });
        } else {
            this.refresh(function (err) {
                if (err) {
                    cb (err);
                } else {
                    if (this._serverData) {
                        this._serverData.comparisonSystems(function (bserr, systems) {
                            if (systems) me._compareSystemCache = systems;
                            cb (bserr, systems);
                        });
                    } else {
                        // See comment in getBuildSystems
                        cb (new Error('Server data was unreachable, but an error was not returned. Contact an administrator, this is a problem.'));
                    }
                }
            });
        }
    }
};

/**
 * @return {Array.<ComparisonSystem>|null}
 */
BuildServer.prototype.getCachedComparisonSystems = function () {
    return this._compareSystemCache;
};

/**
 * Force a refresh of the data in the build server. Re-fetches all information.
 * @param cb {function (err: Error|null)}
 */
BuildServer.prototype.refresh = function (cb) {
    var me = this;
    console.log('Starting refresh of server ' + (this._serverData ? this._serverData.serverName : '[unidentified]') + '...');
    this._serverData = null;
    this._serverStatus = null;
    this._buildSystemCache = null;
    this._compareSystemCache = null;
    // TODO KAM: Change this to async
    this.getServerData(function (sderr) {
        if (sderr) {
            console.log('BuildServer.js: Error refreshing server data - ' + sderr.message);
            cb (sderr);
        } else {
            me.getBuildStatus(function (bserr) {
                if (bserr) {
                    console.log('BuildServer.js: Error refreshing build status - ' + bserr.message);
                    cb(bserr);
                } else {
                    me.getComparisonSystems(function (cserr) {
                        if (cserr) {
                            cb(cserr);
                            console.log('BuildServer.js: Error refreshing comparison system list - ' + cserr.message);
                        } else {
                            me.getBuildSystems(function (bsserr) {
                                if (bsserr) {
                                    cb(bseerr);
                                    console.log('BuildServer.js: Error refreshing build system list - ' + bsserr.message);
                                } else {
                                    console.log('Success!');
                                    cb(null);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 * Make sure the connection is still valid by pinging the build server with a basic query
 * @param cb {function (err: Error|null)}
 */
BuildServer.prototype.ping = function (cb) {
    this._serverStatus = null;
    this.getBuildStatus(function (bserr) {
        cb(bserr || null)
    });
};

/**
 * @return {BuildServerStatus|null}
 */
BuildServer.prototype.getCachedServerState = function() {
    return this._serverStatus;
};

/**
 * @return {ServerData|null}
 */
BuildServer.prototype.getCachedServerData = function () {
    return this._serverData;
};

/**
 * @param buildSystemId {string} ID of the build system in question
 * @returns {BuildSystemData|null}
 */
BuildServer.prototype.getBuildSystemSync = function (buildSystemId) {
    if (!this._buildSystemCache) {
        return null;
    } else {
        for (var i = 0; i < this._buildSystemCache.length; i++) {
            if (this._buildSystemCache[i].id === buildSystemId) {
                return this._buildSystemCache[i];
            }
        }

        return null;
    }
};

/**
 * @param comparisonSystemId {string} ID of the comparison system in question
 * @returns {ComparisonSystem|null}
 */
BuildServer.prototype.getComparisonSystemSync = function (comparisonSystemId) {
    if (!this._compareSystemCache) {
        return null;
    } else {
        for (var i = 0; i < this._compareSystemCache.length; i++) {
            if (this._compareSystemCache[i].id === comparisonSystemId) {
                return this._compareSystemCache[i];
            }
        }

        return null;
    }
};

exports.BuildServer = BuildServer;

BuildSystemData = require('./BuildSystemData').BuildSystemData;
ServerData = require('./ServerData').ServerData;
BuildConstraints = require('./BuildConstraints').BuildConstraints;
BuildServerStatus = require('./BuildServerStatus').BuildServerStatus;