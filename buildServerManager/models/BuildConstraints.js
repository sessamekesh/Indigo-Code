/**
 * Created by Kamaron on 7/11/2015.
 *
 * REQUIRED FOR INDIGO-CODE-BUILDSERVER v0.1 INTERFACE
 *
 * Holds data about the build constraints on a server
 */

/**
 * Build constraints employed by a server. Follows v0.1 specification for the Indigo Code Buildserver
 * @param maxConcurrentTests {Number} Quantity of tests that may be concurrently running on the system
 * @param queueSize {Number} Number of pending builds that may be stored on the build server
 * @param resultsAvailabilityTimeout {Number} Time (in milliseconds) after completion of build for which results
 *   are cached on the buildserver
 * @constructor
 */
var BuildConstraints = function (maxConcurrentTests, queueSize, resultsAvailabilityTimeout) {
    this.maxConcurrentTests = maxConcurrentTests;
    this.queueSize = queueSize;
    this.resultsAvailabilityTimeout = resultsAvailabilityTimeout;
};

module.exports.BuildConstraints = BuildConstraints;

/**
 *  var me = this;
 rest.get('http://' + this._hostname + ':' + this._port + apiSpecRoot + '/server-data')
 .on('success', function (data, response) {
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
                cb(me._serverData);
            }).on('fail', function (data, response) {
                console.log('Fail!');
                console.log(data);
                console.log(response);
                cb(null);
            }).on('error', function (err, response) {
                console.log('Error!');
                console.log(err);
                console.log(response);
                cb(null);
            }).on('timeout', function (ms) {
                console.log('Timeout!');
                console.log(ms);
                cb(null);
            }
 );
 */