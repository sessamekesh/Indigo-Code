/**
 * Created by Kamaron on 5/30/2015.
 */

var comp_dao = require('../dao/competition_dao');

/**
 * Contains server information about the rules of a competition, is passed to .jade file administrators provide
 *  that illustrates the rules of a given competition
 * @param comp_data {comp_dao.CompData} Which competition is in question
 * @constructor
 */
module.exports = function (comp_data) {
    this.comp_name = comp_data.name;
};