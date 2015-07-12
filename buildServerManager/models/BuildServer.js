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
     * @type {BuildSystemData|null}
     * @private
     */
    this._serverData = null;

    /**
     * @type {BuildServerStatus|null}
     * @private
     */
    this._serverStatus = null;

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
                        data['buildSystems'],
                        data['comparisonSystems']
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
 * Force a refresh of the data in the build server. Re-fetches all information.
 * @param cb {function (err: Error|null)}
 */
BuildServer.prototype.refresh = function (cb) {
    var me = this;
    this._serverData = null;
    this._serverStatus = null;
    this.getServerData(function (sderr) {
        if (sderr) {
            console.log('Error refreshing server data - ' + sderr.message);
            cb (sderr);
        } else {
            me.getBuildStatus(function (bserr) {
                if (bserr) {
                    console.log('Error refreshing build status - ' + bserr.message);
                    cb(bserr);
                } else {
                    cb(null);
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

exports.BuildServer = BuildServer;

BuildSystemData = require('./BuildSystemData').BuildSystemData;
ServerData = require('./ServerData').ServerData;
BuildConstraints = require('./BuildConstraints').BuildConstraints;
BuildServerStatus = require('./BuildServerStatus').BuildServerStatus;