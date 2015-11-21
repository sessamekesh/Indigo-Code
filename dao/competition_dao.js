/**
 * Created by Kamaron on 4/22/2015.
 */

var db = require('./db');
var ProblemData = require('./problem_dao').ProblemData;

/**
 *
 * @param id {number} ID of the competition specified
 * @param name {string} Name of the competition specified
 * @param start_date {number} UNIX timestamp of start date (milliseconds)
 * @param end_date {number} UNIX timestamp of end date (milliseconds)
 * @param time_penalty {number} Time penalty, in seconds, of incorrect submission
 * @param max_team_size {number} Maximum size of a team allowed
 * @return {{id: number, name: string, start_date: number, end_date: number, time_penalty: number, max_team_size: number}}
 * @constructor
 */
exports.CompData = function (id, name, start_date, end_date, time_penalty, max_team_size) {
    this.id = id;
    this.name = name;
    this.start_date = start_date;
    this.end_date = end_date;
    this.time_penalty = time_penalty;
    this.max_team_size = max_team_size;
};

/**
 * Attempt to find any problems with the CompData object before inserting
 * @returns Array<object>
 */
exports.CompData.prototype.validateInsert = function() {
    var err_list = [];

    if (!this.name) {
        err_list.push({ field: 'name', error: 'No competition name provided' });
    }

    if (!this.start_date) {
        err_list.push({ field: 'start_date', error: 'No starting date and time provided' });
    }

    if (!this.end_date) {
        err_list.push({ field: 'end_date', error: 'No ending date and time provided' });
    }

    if (new Date(this.start_date) > new Date(this.end_date)) {
        err_list.push({ field: 'end_date', error: 'Ending date happens before starting date' });
    }

    if (isNaN(parseInt(this.time_penalty))) {
        err_list.push({ field: 'time_penalty', error: 'No time penalty provided' });
    }

    if (isNaN(parseInt(this.max_team_size))) {
        err_list.push({ field: 'max_team_size', error: 'No maximum team size provided' });
    }

    if (this.max_team_size < 1) {
        err_list.push({ field: 'max_team_size', error: 'Maximum team size must be at least one' });
    }

    return err_list;
};

/**
 * Get competition data for the given competition
 * @param comp_id {number} ID of the competition in question
 * @param cb {function(err: Error, result: exports.CompData=)} Callback, taking err, result as parameters (result is type CompData)
 */
exports.get_competition_data = function (comp_id, cb) {
    if (isNaN(parseInt(comp_id))) {
        cb(new Error('Must provide an integer competition ID'));
    } else {
        db.owl_query('SELECT id, name, start_date, end_date, time_penalty, max_team_size '
            + 'FROM competition WHERE id=?;',
            [comp_id],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    if (res.length !== 1) {
                        cb(new Error('No competition found with given ID'));
                    } else {
                        cb(null, new exports.CompData(res[0].id, res[0].name, res[0].start_date, res[0].end_date,
                            res[0].time_penalty, res[0].max_team_size));
                    }
                }
            }
        );
    }
};

/**
 * Calls callback containing an array of previous competitions (all CompData objects)
 * @param cb {function}
 */
exports.get_previous_competitions = function (cb) {
    db.owl_query('SELECT id, name, start_date, end_date, time_penalty, max_team_size FROM competition '
        + 'WHERE end_date < FROM_UNIXTIME(?);', [Date.now() / 1000], function (err, res) {
            if (err) {
                cb(err);
            } else {
                cb(null, res.map(function (element) {
                    return new exports.CompData(element.id, element.name, element.start_date,
                        element.end_date, element.time_penalty, element.max_team_size);
                }));
            }
        }
    );
};

/**
 * Calls callback function containing an array of ongoing competitions (all CompData objects)
 * @param cb {function}
 */
exports.get_ongoing_competitions = function (cb) {
    db.owl_query('SELECT id, name, start_date, end_date, time_penalty, max_team_size FROM competition '
        + 'WHERE end_date > FROM_UNIXTIME(?) AND start_date < FROM_UNIXTIME(?);', [Date.now() / 1000, Date.now() / 1000], function (err, res) {
            if (err) {
                cb(err);
            } else {
                cb(null, res.map(function (element) {
                    return new exports.CompData(element.id, element.name, element.start_date,
                        element.end_date, element.time_penalty, element.max_team_size);
                }));
            }
        }
    );
};

/**
 * Calls callback with list of competitions that are upcoming (all CompData objects)
 * @param cb {function}
 */
exports.get_upcoming_competitions = function (cb) {
    db.owl_query('SELECT id, name, start_date, end_date, time_penalty, max_team_size FROM competition '
        + 'WHERE start_date > FROM_UNIXTIME(?);', [Date.now() / 1000], function (err, res) {
            if (err) {
                cb(err);
            } else {
                cb(null, res.map(function (element) {
                    return new exports.CompData(element.id, element.name, element.start_date,
                        element.end_date, element.time_penalty, element.max_team_size);
                }));
            }
        }
    );
};

/**
 * Get all competitions that may occur, past present and future
 * @param cb {function (err: Error=, res: Array.<CompData>=)}
 */
exports.getAllCompetitions = function (cb) {
    db.owl_query('SELECT id, name, start_date, end_date, time_penalty, max_team_size FROM competition;',
        [],
        function (dberr, dbres) {
            if (dberr) {
                cb(dberr);
            } else {
                cb(null, dbres.map(function (a) {
                    return new exports.CompData(
                        a['id'], a['name'],
                        a['start_date'], a['end_date'],
                        a['time_penalty'], a['max_team_size']
                    );
                }));
            }
        }
    );
};

/**
 * Create a new database entry with a competition
 * @param comp_data {exports.CompData} Object containing competition data to be inserted
 * @param cb {function (Error=, exports.CompData=)}
 */
exports.create_competition = function (comp_data, cb) {
    if (!comp_data.name || comp_data.name === '') {
        cb(new Error('Must provide a name for the competition!'));
    } else if (isNaN(parseInt(comp_data.start_date))) {
        cb(new Error('Start date must be provided, and a positive integer'));
    } else if (isNaN(parseInt(comp_data.end_date))) {
        cb(new Error('End date must be provided, and a positive integer'));
    } else if (isNaN(parseInt(comp_data.time_penalty))) {
        cb(new Error('Time penalty must be provided, and a positive integer'));
    } else if (isNaN(parseInt(comp_data.max_team_size))) {
        cb(new Error('Max team size must be provided, and a postitive integer'));
    } else {
        db.owl_query('INSERT INTO competition (name, start_date, end_date, time_penalty, max_team_size) VALUES '
            + ' (?, ?, ?, ?, ?);',
            [comp_data.name, comp_data.start_date, comp_data.end_date, comp_data.time_penalty, comp_data.max_team_size],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, new exports.CompData(res.insertId, comp_data.name, comp_data.start_date,
                        comp_data.end_date, comp_data.time_penalty, comp_data.max_team_size));
                }
            }
        );
    }
};

/**
 *
 * @param compID {number}
 * @param cb {function (err: Error=)}
 */
exports.removeCompetition = function (compID, cb) {
    if (isNaN(parseInt(compID))) cb(new Error('Cannot remove a competition where ID is not an integer'));
    else db.owl_query('DELETE FROM competition WHERE id = ? LIMIT 1;', [compID], cb);
};

/**
 * Get all of the problems in the given competition
 * @param compId {number}
 * @param cb {function (err: Error|null, res: Array.<ProblemData>?)}
 */
exports.getProblemsInCompetition = function (compId, cb) {
    if (isNaN(compId)) {
        cb(new Error('No competition with given ID found'));
    } else {
        db.owl_query(
            'SELECT id, name, comp_id, default_time_limit_ms, valid FROM problem WHERE comp_id = ?;',
            [compId],
            function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, res.map(
                        function (rsl) {
                            return new ProblemData(
                                rsl['id'],
                                rsl['name'],
                                rsl['comp_id'],
                                rsl['default_time_limit_ms'],
                                !!rsl['valid'][0]
                            );
                        }
                    ));
                }
            }
        );
    }
};