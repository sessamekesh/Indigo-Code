/**
 * Created by kamaron on 9/6/15.
 *
 * Contains data about a build package, nothing too special.
 */

/**
 * @param buildSystem {BuildSystem} ID of the build system to use
 * @param comparisonSystemsNeeded {Array.<ComparisonSystem>} List of comparison systems needed to use
 * @param packageFileLocation {string} URI on the local server of the build package to send
 * @param onSend {function(err: Error=)} Method to invoke when the build has been sent to the build server
 * @param onReceiveResult {function (err: Error=, buildResult: BuildResult=)} Method to invoke when a result has been received
 * @constructor
 */
var BuildRequest = function (buildSystem, comparisonSystemsNeeded, packageFileLocation, onSend, onReceiveResult) {
    /**
     * @type {BuildSystem}
     */
    this.buildSystem = buildSystem;

    /**
     * @type {Array.<string>}
     */
    this.comparisonSystemList = comparisonSystemsNeeded;

    /**
     * @type {string}
     */
    this.packageFileLocation = packageFileLocation;

    /**
     * Has the build been sent to the build server?
     * @type {boolean}
     */
    this.requestSent = false;

    /**
     * Has the build been performed by the build server?
     * @type {boolean}
     */
    this.buildPerformed = false;

    /**
     * @type {function(Error=)}
     */
    this.onSend = onSend || function () {};

    /**
     * @type {function(Error=, BuildResult=)}
     */
    this.onReceiveResult = onReceiveResult || function () {};
};

exports.BuildRequest = BuildRequest;