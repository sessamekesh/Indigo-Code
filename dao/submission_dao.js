/**
 * Created by Kamaron on 9/7/2015.
 */

var db = require('./db');

/**
 * @param id {number|null}
 * @param teamId {number}
 * @param problemId {number}
 * @param languageId {string}
 * @param result {string}
 * @param timestamp {number}
 * @param notes {string}
 * @param affectsScore {boolean}
 * @constructor
 */
var SubmissionData = function (id, teamId, problemId, languageId, result, timestamp, notes, affectsScore) {
    this.id = id;
    this.teamId = teamId;
    this.problemId = problemId;
    this.languageId = languageId;
    this.result = result;
    this.timestamp = timestamp;
    this.notes = notes;
    this.affectsScore = affectsScore;
};

exports.SubmissionData = SubmissionData;


/**
 * @param submissionData {SubmissionData}
 * @param callback {function (err: Error=, result: SubmissionData=)}
 */
exports.createSubmission = function (submissionData, callback) {
    // TODO KAM: You need to also update the score here.
    db.owl_query(
        'INSERT INTO submission (team_id, problem_id, language_id, result, timestamp, notes, affects_score) '
        + 'VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), ?, ?);',
        [
            submissionData.teamId, submissionData.problemId, submissionData.languageId,
            submissionData.result, submissionData.timestamp / 1000, submissionData.notes,
            submissionData.affectsScore
        ],
        function (dberr, dbres) {
            if (dberr) {
                callback(dberr);
            } else {
                callback(null, new SubmissionData(
                    dbres.insertId,
                    submissionData.teamId,
                    submissionData.problemId,
                    submissionData.languageId,
                    submissionData.result,
                    submissionData.timestamp,
                    submissionData.notes,
                    submissionData.affectsScore
                ));
            }
        }
    );
};

/**
 * @param submissionID {number} ID of the submission in question
 * @param callback {function (err: Error=, result: SubmissionData=)}
 */
exports.getSubmissionData = function (submissionID, callback) {
    if (isNaN(parseInt(submissionID))) {
        callback(new Error('No submission ID provided'));
    } else {
        db.owl_query(
            'SELECT id, team_id, problem_id, language_id, result, UNIX_TIMESTAMP(timestamp) AS timestamp, notes, affects_score FROM submission WHERE id = ?;',
            [submissionID],
            function (dberr, dbres) {
                if (dberr) {
                    callback(dberr);
                } else if (dbres.length === 0) {
                    callback(new Error('No submission with the given ID found'));
                } else {
                    callback(
                        null,
                        new SubmissionData(
                            dbres[0]['id'],
                            dbres[0]['team_id'],
                            dbres[0]['problem_id'],
                            dbres[0]['language_id'],
                            dbres[0]['result'],
                            dbres[0]['timestamp'] * 1000,
                            dbres[0]['notes'],
                            dbres[0]['affects_score'][0]
                        )
                    );
                }
            }
        )
    }
};

/**
 * Update the submission with the given ID to have the given results (performed when a build finishes)
 * @param submissionId {number} The ID of the submission in question
 * @param result {string}
 * @param notes {string}
 * @param affectsScore {boolean=}
 * @param callback {function (err: Error=)}
 */
exports.updateSubmission = function (submissionId, result, notes, affectsScore, callback) {
    // TODO KAM: You need to also update the score here
    if (isNaN(parseInt(submissionId))) {
        callback(new Error('No submission ID provided to updateSubmission method'));
    } else {
        db.owl_query(
            'UPDATE submission SET result=?, notes=?, affects_score=? WHERE id=?;',
            [result || 'ISE', notes || '', affectsScore || false, submissionId],
            function (dberr, dbres) {
                if (dberr) {
                    callback(dberr);
                } else if (dbres.affectedRows === 0) {
                    callback(new Error('No submission found with the given ID', submissionId));
                } else {
                    callback();
                }
            }
        );
    }
};

/**
 * Gets the submissions attached to the problem specified
 * @param problemId {number}
 * @param offset {number|null}
 * @param count {number|null}
 * @param callback {function (err: Error=, results: Array.<SubmissionData>=)}
 */
exports.getSubmissionsInProblem = function (problemId, offset, count, callback) {
    if (isNaN(parseInt(problemId))) {
        callback(new Error('No problem ID provided'));
    } else if (!isNaN(parseInt(offset)) && !isNaN(parseInt(count))) {
        db.owl_query(
            'SELECT id, team_id, problem_id, language_id, result, UNIX_TIMESTAMP(timestamp) AS timestamp, notes, affects_score FROM submission WHERE problem_id = ? ORDER BY id LIMIT ?, ?;',
            [problemId, parseInt(offset), parseInt(count)],
            onResult
        );
    } else {
        db.owl_query(
            'SELECT id, team_id, problem_id, language_id, result, UNIX_TIMESTAMP(timestamp) AS timestamp, notes, affects_score FROM submission WHERE problem_id = ?;',
            [problemId],
            onResult
        );
    }

    function onResult (dberr, dbres) {
        if (dberr) {
            callback(dberr);
        } else {
            callback(null, dbres.map(function (row) {
                return new SubmissionData(
                    row['id'],
                    row['team_id'],
                    row['problem_id'],
                    row['language_id'],
                    row['result'],
                    row['timestamp'] * 1000,
                    row['notes'],
                    row['affects_score'][0]
                )
            }));
        }
    }
};