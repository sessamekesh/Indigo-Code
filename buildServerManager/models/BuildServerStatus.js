/**
 * Created by Kamaron on 7/12/2015.
 *
 * REQUIRED FOR INDIGO-CODE-BUILDSERVER v0.1 INTERFACE
 *
 * Holds data about the status of a build server
 */

var STATUS_CODES = {
    READY: 'READY',
    WAITING: 'WAITING_FOR_PROCESS_LOCK',
    BUSY: 'BUSY'
};

/**
 * Holds the build status (as per Indigo Code Buildserver v0.1 specification) of a connected
 *  build server
 * @param status {String} Status of the build server. Must match one of the v0.1 spec statuses
 * @param queued {Number} Number of queued builds on the server currently
 * @param executing {Number} Number of currently executing builds
 * @constructor
 */
var BuildServerStatus = function (status, queued, executing) {
    /**
     * Is the server status state valid?
     * @type {boolean}
     */
    this.isValid = (status === STATUS_CODES.READY
        || status === STATUS_CODES.WAITING
        || status === STATUS_CODES.BUSY
    );

    /**
     * @type {String}
     */
    this.status = status;

    /**
     * @type {Number}
     */
    this.queued = queued;

    /**
     * @type {Number}
     */
    this.executing = executing;
};

exports.STATUS_CODES = STATUS_CODES;
exports.BuildServerStatus = BuildServerStatus;