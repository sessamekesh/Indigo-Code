/**
 * Created by root on 4/1/15.
 */

var credentials = require('./credentials');

/**
 * Method to add a new competition to the system
 * @param name Name of the competition (e.g., 'ACM 2015 Spring')
 * @param start Start date and time of competition (UNIX timestamp, seconds)
 * @param end End date and time of competition (UNIX timestamp, seconds)
 * @param penalty Time penalty for penalized incorrect submissions
 * @param team_size Max team size allowable
 * @param cb Callback function to invoke after SQL query
 */
exports.addNewCompetition = function (name, start, end, penalty, team_size, cb) {
    if (name === undefined || name === '') {
        cb(undefined, 'Must provide name of competition ' + name);
    } else if (start === undefined || parseInt(start) === NaN) {
        cb(undefined, 'Invalid start time of competition ' + start);
    } else if (end === undefined || parseInt(end) === NaN) {
        cb(undefined, 'Invalid end time of competition ' + end);
    } else if (penalty === undefined || parseInt(penalty) === NaN) {
        cb(undefined, 'Invalid time penalty for competition ' + penalty);
    } else if (team_size === undefined || parseInt(team_size) === NaN) {
        cb(undefined, 'Invalid max team size for competition ' + team_size);
    } else {
        credentials.zora_query('INSERT INTO Competition (name, start_date, end_date, time_penalty, max_team_size) '
        + 'VALUES (?, ?, ?, ?, ?);', [name, start, end, penalty, team_size], function (err, res) {
            if (err) {
                cb(undefined, 'MySQL error: ' + JSON.stringify(err));
            } else {
                cb(res.insertId);
            }
        });
    }
};

exports.getCompetitionData = function (compID, cb) {
    if (compID === undefined || parseInt(compID) === NaN) {
        cb(undefined, 'Must provide a competition ID!');
    } else {
        credentials.zora_query('SELECT id, name, start_date, end_date, time_penalty, max_team_size FROM Competition WHERE id = ?;',
            compID, function (err, res) {
                if (err) {
                    cb(undefined, 'MYSQL error: ' + err);
                } else if (res.length != 1) {
                    cb(undefined, 'Competition not found!');
                } else {
                    cb({
                        id: res[0].id,
                        name: res[0].name,
                        start_date: res[0].start_date,
                        end_date: res[0].end_date,
                        time_penalty: res[0].time_penalty,
                        max_team_size: res[0].max_team_size
                    });
                }
            }
        );
    }
};

/**
 * Modify data for an existing competition
 * @param compID Competition ID of competition to modify
 * @param newData Object containing key-value pairs of fields to update and values, respectively
 *              Fields: name, start, end, penalty, team_size
 * @param cb Callback function to invoke on completion of the function
 */
exports.modifyExistingCompetition = function (compID, newData, cb) {
    newData = newData || {};
    if (compID === undefined || parseInt(compID) === NaN) {
        cb(undefined, 'Must provide competition ID of competition to modify!');
    } else {
        // Get existing competition data...
        exports.getCompetitionData(compID, function (res, err) {
            if (err) {
                cb(undefined, 'Could not fetch existing competition: ' + err);
            } else {
                newData.name = newData.name || res.name;
                newData.start_date = newData.start_date || newData.start;
                newData.start_date = newData.start_date || res.start_date;
                newData.end_date = newData.end_date || newData.end;
                newData.end_date = newData.end_date || res.end_date;
                newData.time_penalty = newData.time_penalty || res.time_penalty;
                newData.max_team_size = newData.max_team_size || res.max_team_size;

                credentials.zora_query('UPDATE Competition SET name = ?, start_date = ?, end_date = ?, time_penalty = ?, max_team_size = ? WHERE id = ?;',
                    [newData.name, newData.start_date, newData.end_date, newData.time_penalty, newData.max_team_size, compID], function (err, res) {
                        if (err) {
                            cb(undefined, 'MYSQL error: ' + JSON.stringify(err));
                        } else {
                            cb(res);
                        }
                    }
                );
            }
        });
    }
};

exports.deleteCompetition = function (compID, cb) {
    if (compID === undefined || parseInt(compID) === NaN) {
        cb(undefined, 'No competition ID provided!');
    } else {
        credentials.zora_query('DELETE FROM Competition WHERE id = ? LIMIT 1;', compID, function (err, res) {
            if (err) {
                cb(undefined, 'MySQL error: ' + JSOn.stringify(err));
            } else {
                cb(res);
            }
        });
    }
};

exports.getUpcomingCompetitions = function (cb) {
    credentials.zora_query('SELECT id, name FROM Competition WHERE start_date > NOW();', [], function (err, res) {
        if (err) {
            cb(undefined, 'MYSQL err: ' + err);
        } else {
            var tr = [];
            for (var i = 0; i < res.length; i++) {
                tr.push({
                    id: res[i].id,
                    name: res[i].name
                });
            }
            cb(tr);
        }
    });
};

exports.getOngoingCompetitions = function (cb) {
    credentials.zora_query('SELECT id, name FROM Competition WHERE start_date < NOW() AND end_date > NOW();', [], function (err, res) {
        if (err) {
            cb(undefined, 'MySQL err: ' + JSON.stringify(err));
        } else {
            var tr = [];
            for (var i = 0; i < res.length; i++) {
                tr.push({
                    id: res[i].id,
                    name: res[i].name
                });
            }
            cb(tr);
        }
    });
};

exports.getOldCompetitions = function (cb) {
    credentials.zora_query('SELECT id, name FROM Competition WHERE end_date < NOW();', [], function (err, res) {
        if (err) {
            cb(undefined, 'MYSQL err: ' + err);
        } else {
            var tr = [];
            for (var i = 0; i < res.length; i++) {
                tr.push({
                    id: res[i].id,
                    name: res[i].name
                });
            }
            cb(tr);
        }
    });
};