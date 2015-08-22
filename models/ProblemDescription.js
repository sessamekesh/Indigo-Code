/**
 * Created by Kamaron on 8/21/2015.
 */

var problemDao = require('../dao/problem_dao');

/**
 * Object to be passed to all problem description files created by the user. Contains information relevant
 *  to the problem.
 * @param problemData
 * @constructor
 */
var ProblemDescription = function (problemData) {
    this.problemData = problemData;
};

exports.ProblemDescription = ProblemDescription;