/**
 * Created by Kamaron on 9/7/2015.
 */

var db = require('./db');
var competition_dao = require('./competition_dao');
var user_dao = require('./user_dao');

var async = require('async');

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
 *
 * @param id {number} Integer ID of the submission in question
 * @param teamName {string} Name of the team who made this submission
 * @param teamTagline {string} Tagline of the team who made this submission
 * @param serverTime {number} UNIX timestamp (ms) when this submission was made
 * @param languageID {string} Language ID (identified on the BuildServer)
 * @param result {string}
 * @param notes {string}
 * @param affectsScore {bool} True if the submission actually affects the final score
 * @constructor
 */
exports.SubmissionRenderData = function (id, teamName, teamTagline, serverTime, languageID, result, notes, affectsScore) {
    this.id = id;
    this.teamName = teamName;
    this.teamTagline = teamTagline;
    this.serverTime = serverTime;
    this.languageID = languageID;
    this.results = result;
    this.notes = notes;
    this.affectsScore = affectsScore;
};


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
                    db.owl_query(
                        'SELECT team_id FROM submission WHERE id=?;',
                        [submissionId],
                        function (siderr, sidres) {
                            if (siderr) {
                                callback (siderr);
                            } else {
                                exports.updateTeamScore(sidres[0].team_id, callback);
                            }
                        }
                    );
                }
            }
        );
    }
};

/**
 * @param teamID {number}
 * @param callback {function (err: Error=, results: TeamData=)}
 */
exports.updateTeamScore = function (teamID, callback) {
    async.waterfall([
        // Get competition data
        function (callback) {
            db.owl_query('SELECT comp_id FROM team WHERE id = ?;', [teamID], function (dberr, dbres) {
                if (dberr) { callback(dberr); }
                else if (dbres.length == 0) { callback(new Error('No team found with given ID')); }
                else {
                    competition_dao.get_competition_data(dbres[0]['comp_id'], callback);
                }
            });
        },

        // Get all problems in the competition
        function (compData, callback) {
            competition_dao.getProblemsInCompetition(compData.id, function (pcerr, pcres) {
                if (pcerr) { callback(pcerr); }
                else {
                    callback(null, {
                        compData: compData,
                        probList: pcres
                    });
                }
            });
        },

        // For each problem in the competition
        function (data, callback) {
            async.map(data.probList,
                function (problem, scoreCallback) {
                    async.waterfall([
                        // Get the first AC solution within competition timeframe
                        function (accallback) {
                            db.owl_query('SELECT timestamp FROM submission WHERE team_id = ? AND problem_id = ? AND result = \'AC\' ORDER BY timestamp ASC LIMIT 1;',
                                [teamID, problem.id],
                                accallback
                            );
                        },

                        // If none exist, score = 0, time penalty = 0;
                        function (lastSubmissionTime, accallback) {
                            if (lastSubmissionTime.length === 0) {
                                accallback(null, {
                                    score: 0,
                                    time_penalty: 0,
                                    incorrect_submission_penalty: 0
                                });
                            } else {
                                // If one exists, score = 1, time penalty = (seconds into competition of first submission)
                                var score = 1;
                                var timep = (new Date(lastSubmissionTime[0].timestamp) - new Date(data.compData.start_date)) / 1000;

                                // For every incorrect submission after competition start but before first AC submission, add
                                //  on TIME_PENALTY seconds to incorrect submission penalty
                                db.owl_query('SELECT COUNT(*) AS ct FROM submission WHERE team_id = ? AND problem_id = ? AND '
                                    + '(result = \'re\' OR result=\'tle\' OR result=\'wa\') AND timestamp < ?;',
                                    [teamID, problem.id, lastSubmissionTime[0].timestamp],
                                    function (cterr, ctres) {
                                        if (cterr) { accallback(cterr); }
                                        else {
                                            accallback(null, {
                                                score: score,
                                                time_penalty: timep,
                                                incorrect_submission_penalty: ctres[0].ct
                                            });
                                        }
                                    }
                                );
                            }
                        }
                    ], scoreCallback);
                },
                function (err, results) {
                    if (err) { callback (err); }
                    else {
                        callback(null, {
                            compData: data.compData,
                            probList: data.probList,
                            results: results
                        });
                    }
                }
            );
        },

        // Update score = sum of scores returned, time penalty = maximum time penalty plus sum of incorrect submission penalties
    ], function (err, result) {
        var score = result.results.map(function (a) { return a.score; }).reduce(function (a, b) { return a + b; });
        var base_time_penalty = Math.max.apply(Math, result.results.map(function (a) { return a.time_penalty; }));
        var addtl_time_penalty = result.results.map(function (a) { return a.incorrect_submission_penalty; }).reduce(function (a, b) { return a + b; });

        db.owl_query('UPDATE team SET score = ?, time_penalty = ? WHERE id = ?;',
            [score, base_time_penalty + addtl_time_penalty, teamID],
            function (dberr, dbres) {
                if (dberr) {
                    callback (dberr);
                } else {
                    user_dao.getTeam(teamID, callback);
                }
            }
        );
    });
};

/**
 * Gets the submissions attached to the problem specified
 * @param problemId {number}
 * @param offset {number|null}
 * @param count {number|null}
 * @param callback {function (err: Error=, results: Array.<SubmissionRenderData>=)}
 */
exports.getSubmissionsInProblem = function (problemId, offset, count, callback) {
    if (isNaN(parseInt(problemId))) {
        callback(new Error('No problem ID provided'));
    } else if (!isNaN(parseInt(offset)) && !isNaN(parseInt(count))) {
        db.owl_query(
            'SELECT S.id, T.name AS teamName, T.tagline AS teamTagline, problem_id, language_id, result, UNIX_TIMESTAMP(timestamp) AS timestamp, notes, affects_score FROM submission S JOIN team T ON S.team_id = T.id WHERE problem_id = ? ORDER BY S.id LIMIT ?, ?;',
            [problemId, parseInt(offset), parseInt(count)],
            onResult
        );
    } else {
        db.owl_query(
            'SELECT S.id, T.name AS teamName, T.tagline AS teamTagline, problem_id, language_id, result, UNIX_TIMESTAMP(timestamp) AS timestamp, notes, affects_score FROM submission S JOIN team T ON S.team_id = T.id WHERE problem_id = ?;',
            [problemId],
            onResult
        );
    }

    function onResult (dberr, dbres) {
        if (dberr) {
            callback(dberr);
        } else {
            callback(null, dbres.map(function (row) {
                return new exports.SubmissionRenderData(
                    row['id'],
                    row['teamName'],
                    row['teamTagline'],
                    row['timestamp'] * 1000,
                    row['language_id'],
                    row['result'],
                    row['notes'],
                    row['affects_score'][0]
                )
            }));
        }
    }
};