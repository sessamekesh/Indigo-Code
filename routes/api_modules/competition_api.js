/**
 * Created by kamaron on 4/2/15.
 */

var competition_dao = require('../../dao/competition_dao'),
    url = require('url');

exports.get_past = function (req, res) {
    console.log('Requeseted list of past competitions...');
    competition_dao.getOldCompetitions(function (rsl, err) {
        if (err) {
            res.send(400, { 'success': false, 'error': req.url, 'reason': err});
        } else {
            res.send({ 'success': true, 'result': rsl});
        }
    })
};

exports.get_present = function (req, res) {
    console.log('Requeseted list of all competitions...');
    competition_dao.getOngoingCompetitions(function (rsl, err) {
        if (err) {
            res.send(400, { 'success': false, 'error': req.url, 'reason': err});
        } else {
            res.send({ 'success': true, 'result': rsl});
        }
   });
};

exports.get_future = function (req, res) {
    console.log('Requeseted list of all competitions...');
    competition_dao.getUpcomingCompetitions(function (rsl, err) {
        if (err) {
            res.send(400, { 'success': false, 'error': req.url, 'message': err});
        } else {
            res.send({ 'success': true, 'result': rsl});
        }
    })
};

exports.get_comp_data = function (req, res) {
    console.log('Competition page solo requested, checking for parameters...');
    var query_params = url.parse(req.url, true).query,
        n_params = Object.keys(query_params).length;

    if (n_params === 0) {
        var trl = [];
        competition_dao.getOldCompetitions(function (rsl, err) {
            if (!err) {
                for (var i = 0; i < rsl.length; i++) {
                    trl.push(rsl[i]);
                }
            } else {
                console.log('api.js: Error fetching old competitions - ' + err);
            }

            competition_dao.getOngoingCompetitions(function (rsl, err) {
                if (!err) {
                    for (var i = 0; i < rsl.length; i++) {
                        trl.push(rsl[i]);
                    }
                } else {
                    console.log('api.js: Error fetching ongoing competitions - ' + err);
                }

                competition_dao.getUpcomingCompetitions(function (rsl, err) {
                    if (!err) {
                        for (var i = 0; i < rsl.length; i++) {
                            trl.push(rsl[i]);
                        }
                    } else {
                        console.log('api.js: Error fetching upcoming competitions - ' + err);
                    }

                    res.send({ 'success': true, 'result': trl});
                });
            });
        });
    } else if (n_params === 1 && parseInt(query_params['id']) !== NaN) {
        competition_dao.getCompetitionData(query_params['id'], function (rsl, err) {
            if (err) {
                console.log('api.js: Error fetching competition ' + query_params['id'] + ' - ' + err);
                res.send(400, { 'success': false, 'error': req.url, 'message': 'Could not fetch competition with given ID', 'id': query_params['id'] });
            } else {
                res.send({ 'success': true, 'result': rsl});
            }
        });
    }
};