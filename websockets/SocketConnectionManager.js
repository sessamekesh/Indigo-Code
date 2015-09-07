/**
 * Created by Kamaron on 9/7/2015.
 *
 * Handles all websocket connections to clients
 */

var socketIO = require('socket.io');
var fs = require('fs');

var SocketNamespace = require('./models/SocketNamespace').SocketNamespace;

/**
 * Manager that handles all socket connections. Must be initialized before use.
 * @constructor
 */
var SocketManager = function () {
    this.io = null;

    /**
     * @type {{string: SocketNamespace}}
     */
    this.namespaces = {};
};

/**
 * Initialize this socket manager
 * @param http {Server}
 */
SocketManager.prototype.init = function (http) {
    this.io = socketIO(http);

    // Go through all of our namespaces that we need to initialize, and initialize them.
    var controllers = fs.readdirSync(__dirname + '/routes');
    for (var i = 0; i < controllers.length; i++) {
        var cl = require('./routes/' + controllers[i]);
        if (cl.Namespace) {
            this.registerNamespace(cl.Namespace);
        }
    }

    console.log('Finished registering sockets');
};

/**
 * Register a namespace with the socket manager
 * @param namespaceDesc {SocketNamespace}
 */
SocketManager.prototype.registerNamespace = function (namespaceDesc) {
    if (!this.io) {
        throw new Error('Could not establish namespace', namespaceDesc.namespace, ': SocketIO not initialized!');
    } else if (this.namespaces[namespaceDesc.namespace]) {
        throw new Error('Duplicate namespace', namespaceDesc.namespace);
    }

    this.io.on('connection', function (socket) {
        console.log('Connection formed!');
    });

    var nsp = this.io.of(namespaceDesc.namespace);

    this.namespaces[namespaceDesc.namespace] = namespaceDesc;

    nsp.on('connection', function (socket) {
        namespaceDesc.addSocket(socket);
    });
};

exports.SocketManager = new SocketManager();