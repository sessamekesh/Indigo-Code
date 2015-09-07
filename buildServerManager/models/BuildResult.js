/**
 * Identical to the BuildResult received by the BuildServer
 * Created by kamaron on 9/4/15.
 */

var RESULTS = {
    CORRECT_ANSWER: 'AC',
    TIME_LIMIT_EXCEEDED: 'TLE',
    BUILD_ERROR: 'BE',
    INTERNAL_SERVER_ERROR: 'IE',
    RUNTIME_ERROR: 'RE',
    WRONG_ANSWER: 'WA'
};

/**
 * Defines the structure of a build request, as per the major version of the build server we are using
 *  (v0.1 standard, in this case)
 * @param result {string} Representing the ultimate result of the build
 * @param notes {string} Notes that may have been passed from the build server
 * @param optionalParams {{string: *}=} Optional parameters (as per minor version of the build server, or customizations)
 * @constructor
 */
var BuildResult = function (result, notes, optionalParams) {
    /** @type {string} */
    this.result = result || RESULTS.INTERNAL_SERVER_ERROR;

    /** @type {string} */
    this.notes = notes || '';

    /** @type {{string: *}} */
    this.optionalParams = optionalParams || {};
};

exports.BuildResult = BuildResult;
exports.RESULTS = RESULTS;