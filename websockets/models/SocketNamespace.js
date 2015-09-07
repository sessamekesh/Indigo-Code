/**
 * Created by Kamaron on 9/7/2015.
 */

/**
 * Represent a socket namespace, events from the socket namespace, and optional methods to perform from server actions
 * @param namespace {string} Namespace of the socket
 * @constructor
 */
var SocketNamespace = function (namespace) {
    /**
     * @type {string}
     */
    this.namespace = namespace;

    /**
     * @type {{string: Array.<function (socket: WebSocket, clientData: Object)>}}
     * @private
     */
    this._clientEvents = {};

    /**
     * List of connected sockets.
     * @type {Array.<Socket>}
     * @private
     */
    this._connectedSockets = [];

    /**
     * ID of the next socket to add to this namespace
     * @type {number}
     * @private
     */
    this._nextSocketID = 0;
};

/**
 * Register a possible client event for this namespace
 * @param name {string} Name of the client event
 * @param method {function (clientData: Object)} Method to invoke on receive client data
 */
SocketNamespace.prototype.addClientEvent = function (name, method) {
    this._clientEvents[name] = this._clientEvents[name] || [];
    this._clientEvents[name].push(method);
};

/**
 * Fire a socket event with the attached data
 * @param name {string}
 * @param data {Object}
 */
SocketNamespace.prototype.fireServerEvent = function (name, data) {
    for (var i = 0; i < this._connectedSockets.length; i++) {
        this._connectedSockets[i].emit(name, data);
    }
};

/**
 * Add a socket connection to this namespace
 * @param socket {Socket}
 */
SocketNamespace.prototype.addSocket = function (socket) {

    var me = this;

    socket.id = this._nextSocketID++;
    this._connectedSockets.push(socket);

    socket.on('disconnect', function () {
        for (var i = 0; i < me._connectedSockets.length; i++) {
            if (me._connectedSockets[i].id === socket.id) {
                me._connectedSockets.splice(i, 1);
            }
        }
    });

    for (var clientEvent in this._clientEvents) {
        if (this._clientEvents.hasOwnProperty(clientEvent)) {
            for (var i = 0; i < this._clientEvents[clientEvent].length; i++) {
                var callback = this._clientEvents[clientEvent][i];
                (function (cb) {
                    socket.on(clientEvent, function (data) {
                        cb(socket, data);
                    });
                })(callback);
            }
        }
    }
};

exports.SocketNamespace = SocketNamespace;