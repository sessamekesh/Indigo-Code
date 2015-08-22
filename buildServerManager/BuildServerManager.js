/**
 * Created by Kamaron on 7/12/2015.
 *
 * Maintains a registry of all attached BuildServers
 *
 * TODO KAM: This is where your build requests should go... Handle all that stuff here
 */

var config = require('../config').config;

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
 * @type {BuildServerManager}
 */
exports.BuildServerManager = new BuildServerManager();