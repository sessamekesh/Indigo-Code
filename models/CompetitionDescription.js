/**
 * Created by Kamaron on 5/30/2015.
 */

var comp_dao = require('../dao/competition_dao');

/**
 * Object to be passed to all competition description files created by the user. Contains information
 *  relevant to the competition.
 * @param comp_data {comp_dao.CompData} Data of competition in question
 * @constructor
 */
module.exports = function(comp_data) {
    this.comp_data = comp_data;
};