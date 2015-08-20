/**
 * Created by Kamaron on 4/22/2015.
 */

var db = require('./db');

exports.ERRORS = {
    EMPTY_PROBLEM_DATA: 'Problem data provided is empty',
    INCOMPLETE_PROBLEM_DATA: 'Problem data provided is incomplete or malformed',
    INVALID_PROBLEM_ID: 'Problem ID provided is invalid'
};

/**
 * Represents a problem entry in the SQL database
 * @param id {number|null} ID of the problem, null if not known
 * @param name {string} Human readable name of the problem
 * @param compId {number} ID of the competition to which this problem belongs
 * @param defaultTimeLimit {number} Time, in milliseconds, that a solution has to solve this problem (by default)
 * @param isValid {boolean} True if there is a valid solution on file for this problem, false otherwise.
 * @constructor
 */
exports.ProblemData = function (id, name, compId, defaultTimeLimit, isValid) {
    this.id = id;
    this.name = name;
    this.compId = compId;
    this.defaultTimeLimit = defaultTimeLimit;
    this.isValid = isValid;
};

/**
 * Validate that the problem data in this object is complete and ready to insert into the database
 * @return {boolean}
 */
exports.ProblemData.prototype.isComplete = function () {
    return (!isNaN(parseInt(this.id)) || this.id === null)
        && !!this.name
        && !isNaN(parseInt(this.compId))
        && !isNaN(parseInt(this.defaultTimeLimit))
        && (this.isValid === true || this.isValid === false);
};

/**
 * Insert a problem into the database
 * @param problemData {exports.ProblemData}
 * @param callback {function(err: Error|null, res: exports.ProblemData=)} Callback with error or inserted problem data returned
 */
exports.insertProblem = function (problemData, callback) {
    if (!problemData) {
        callback(new Error(exports.ERRORS.EMPTY_PROBLEM_DATA));
    } else if (!problemData.isComplete()) {
        callback(new Error(exports.ERRORS.INCOMPLETE_PROBLEM_DATA));
    } else {
        db.owl_query('INSERT INTO problem (name, comp_id, default_time_limit_ms, valid) VALUES (?, ?, ?, ?);', [
                problemData.name,
                problemData.compId,
                problemData.defaultTimeLimit,
                problemData.isValid
            ], function (insertError, insertResult) {
                if (insertError) {
                    callback(insertError);
                } else {
                    callback(null, new exports.ProblemData(
                        insertResult.insertId,
                        problemData.name,
                        problemData.compId,
                        problemData.defaultTimeLimit,
                        problemData.isValid
                    ));
                }
            }
        )
    }
};

/**
 * Removes the given problem from the database
 * @param problemId {number}
 * @param callback {function (err: Error, res: bool)} True if an item was successfully removed, false otherwise
 */
exports.removeProblem = function (problemId, callback) {
    if (isNaN(parseInt(problemId)) || problemId < 0) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else {
        db.owl_query('DELETE FROM problem WHERE id = ? LIMIT 1;', [problemId], function (removeError, removeResult) {
            if (removeError) {
                callback(removeError);
            } else {
                callback(null, removeResult.affectedRows > 0);
            }
        });
    }
};