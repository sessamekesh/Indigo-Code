/**
 * Created by Kamaron on 7/12/2015.
 */

var config = {};

/**
 * The frequency at which to ping any given build server that is attached
 *  to the system, in milliseconds.
 * TODO KAM: Shorten this after development is done
 * @type {number}
 */
config.buildServerUpdateTimeout = 750;

/**
 * The number of retries to reach a build server on a failed attempt.
 * After this number of retries, the build server will be marked as
 *  down, and an admin will have to either disconnect it or manually
 *  attempt a re-connect.
 * It will also be marked as unusable, so make this high if the connection
 *  is potentially spotty.
 * @type {number}
 */
config.buildServerReconnectAttempts = 15;

exports.config = config;