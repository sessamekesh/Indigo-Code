/**
 * Created by Kamaron on 4/22/2015.
 */

var db = require('./db');

exports.ERRORS = {
    EMPTY_PROBLEM_DATA: 'Problem data provided is empty',
    INCOMPLETE_PROBLEM_DATA: 'Problem data provided is incomplete or malformed',
    INVALID_PROBLEM_ID: 'Problem ID provided is invalid',
    INVALID_COMPARISON_SYSTEM_NAME: 'Comparison system name is invalid',
    INVALID_BUILD_SYSTEM_NAME: 'Build system name is invalid',
    INVALID_FILENAME: 'Filename provided is invalid'
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
 * Represents a database entry concerning test case data
 * @param id {number|null} Unique ID of the test case
 * @param problemId {number} Unique ID of the problem to which this test case is attached
 * @param isVisibleDuringCompetition {boolean}
 * @param comparisonSystemName {string} Name of the comparison system to be used (must be supported on build server!)
 * @constructor
 */
exports.TestCaseData = function (id, problemId, isVisibleDuringCompetition, comparisonSystemName) {
    this.id = id;
    this.problemId = problemId;
    this.isVisibleDuringCompetition = isVisibleDuringCompetition;
    this.comparisonSystemName = comparisonSystemName;
};

/**
 * Represents a database entry concerning sample solution data
 * @param id {number|null} Unique ID of te sample solution
 * @param problemId {number} Unique ID of the problem to which this sample solution is attached
 * @param languageId {number} Unique ID of the language in which this sample solution is written
 * @param originalFilename {string} Java! Oh, Java!
 * @constructor
 */
exports.SampleSolutionData = function (id, problemId, languageId, originalFilename) {
    this.id = id;
    this.problemId = problemId;
    this.languageId = languageId;
    this.originalFilename = originalFilename;
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
 * Get data for the problem with the specified ID
 * @param problemId {number}
 * @param callback {function (err: Error=, problemData: exports.ProblemData=)}
 */
exports.getProblemData = function (problemId, callback) {
    if (isNaN(parseInt(problemId))) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else {
        db.owl_query('SELECT id, name, comp_id, default_time_limit_ms, valid FROM problem WHERE id=?;',
            [problemId],
            function (err, res) {
                if (err) {
                    callback(err);
                } else if (res.length != 1) {
                    callback(new Error('No record found with given ID'));
                } else {
                    callback(null, new exports.ProblemData(
                        res[0]['id'],
                        res[0]['name'],
                        res[0]['comp_id'],
                        res[0]['default_time_limit_ms'],
                        !!res[0]['valid'][0]
                    ));
                }
            }
        );
    }
};

/**
 * Removes the given problem from the database
 * @param problemId {number}
 * @param callback {function (err: Error=, res: bool=)} True if an item was successfully removed, false otherwise
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

/**
 * Provide the data for the test cases attached to this problem
 * @param problemId {number}
 * @param callback {function (err: Error=, res: Array.<TestCaseData>=)}
 */
exports.getAttachedTestCases = function (problemId, callback) {
    if (isNaN(parseInt(problemId)) || problemId < 0) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else {
        db.owl_query(
            'SELECT id, problem_id, visible_during_competition, comparison_system_name FROM ' +
            'test_case WHERE problem_id = ?;',
            [problemId],
            function (err, res) {
                if (err) {
                    callback (err);
                } else {
                    callback(null, res.map(
                        function (row) {
                            return new exports.TestCaseData(
                                row['id'],
                                row['problem_id'],
                                !!row['visible_during_competition'][0],
                                row['comparison_system_name']
                            );
                        }
                    ));
                }
            }
        );
    }
};

/**
 * Add a new test case to the database, following the test case data given
 * @param testCaseData {exports.TestCaseData}
 * @param callback {function (err: Error=, res: exports.TestCaseData=)}
 */
exports.createTestCase = function (testCaseData, callback) {
    if (isNaN(parseInt(testCaseData.problemId))) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else if (!testCaseData.comparisonSystemName) {
        callback(new Error(exports.ERRORS.INVALID_COMPARISON_SYSTEM_NAME));
    } else {
        db.owl_query(
            'INSERT INTO test_case (problem_id, visible_during_competition, comparison_system_name) VALUES (?, ?, ?);',
            [testCaseData.problemId, !!testCaseData.isVisibleDuringCompetition, testCaseData.comparisonSystemName],
            function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, new exports.TestCaseData(
                        res.insertId,
                        testCaseData.problemId,
                        !!testCaseData.isVisibleDuringCompetition,
                        testCaseData.comparisonSystemName
                    ));
                }
            }
        );
    }
};

/**
 * Provide data for the sample solutions in this problem
 * @param problemId {number}
 * @param callback {function (err: Error=, result: Array.<SampleSolutionData>=)}
 */
exports.getAttachedSampleSolutions = function (problemId, callback) {
    if (isNaN(parseInt(problemId))) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else {
        db.owl_query(
            'SELECT id, problem_id, language_id, original_filename FROM sample_solution WHERE problem_id = ?;',
            [problemId],
            function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.map(function (row) {
                        return new exports.SampleSolutionData(
                            row['id'],
                            row['problem_id'],
                            row['language_id'],
                            row['original_filename']
                        );
                    }));
                }
            }
        );
    }
};

/**
 * Add a new sample solution to the database, using provided data
 * @param sampleSolutionData {exports.SampleSolutionData}
 * @param callback {function (err: Error=, newSampleSolutionData: exports.SampleSolutionData=)}
 */
exports.createSampleSolution = function (sampleSolutionData, callback) {
    if (isNaN(parseInt(sampleSolutionData.problemId))) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else if (!sampleSolutionData.languageId) {
        callback(new Error(exports.ERRORS.INVALID_BUILD_SYSTEM_NAME));
    } else if (!sampleSolutionData.originalFilename) {
        callback(new Error(exports.ERRORS.INVALID_FILENAME));
    } else {
        db.owl_query(
            'INSERT INTO sample_solution (problem_id, language_id, original_filename) VALUES (?, ?, ?);',
            [sampleSolutionData.problemId, sampleSolutionData.languageId, sampleSolutionData.originalFilename],
            function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, new exports.SampleSolutionData(
                        res['insertId'],
                        sampleSolutionData.problemId,
                        sampleSolutionData.languageId,
                        sampleSolutionData.originalFilename
                    ));
                }
            }
        );
    }
};

/**
 * @param problemId {number}
 * @param languageId {string}
 * @param callback {function (err: Error=, res: number=)}
 */
exports.getTimeLimit = function (problemId, languageId, callback) {
    if (isNaN(problemId)) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else if (!languageId) {
        callback(new Error('Language ID missing'));
    } else {
        db.owl_query(
            'SELECT time_limit_ms FROM allowed_language WHERE problem_id = ? AND language_id = ?;',
            [problemId, languageId],
            function (dberr, dbres) {
                if (dberr) {
                    callback(dberr);
                } else if (dbres.length === 0) {
                    exports.getProblemData(problemId, function (perr, pres) {
                        if (perr) {
                            callback(perr);
                        } else {
                            callback(null, pres.defaultTimeLimit);
                        }
                    });
                } else {
                    callback(dbres[0]['time_limit_ms']);
                }
            }
        );
    }
};

/**
 * Set whether or not a problem is valid, based on the validation step
 * @param problemId {number}
 * @param isValid {boolean}
 * @param callback {function (err: Error=)}
 */
exports.setProblemValidity = function (problemId, isValid, callback) {
    if (isNaN(parseInt(problemId))) {
        callback(new Error(exports.ERRORS.INVALID_PROBLEM_ID));
    } else {
        db.owl_query(
            'UPDATE problem SET valid = ? WHERE id = ?;',
            [isValid, problemId],
            callback
        );
    }
};