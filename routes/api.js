/**
 * Created by kamaron on 4/1/15.
 */

var express = require('express'),
    competition_dao = require('../dao/competition_dao'),
    url = require('url'),
    user_api = require('./api_modules/user_api');

var router = express.Router();

router.get('/competition/past', function (req, res) {
    console.log('Requeseted list of past competitions...');
    competition_dao.getOldCompetitions(function (rsl, err) {
        if (err) {
            res.send(400, { 'success': false, 'error': req.url, 'reason': err});
        } else {
            res.send({ 'success': true, 'result': rsl});
        }
    })
});

router.get('/competition/present', function (req, res) {
    console.log('Requeseted list of all competitions...');
    competition_dao.getOngoingCompetitions(function (rsl, err) {
        if (err) {
            res.send(400, { 'success': false, 'error': req.url, 'reason': err});
        } else {
            res.send({ 'success': true, 'result': rsl});
        }
    })
});

router.get('/competition/future', function (req, res) {
    console.log('Requeseted list of all competitions...');
    competition_dao.getUpcomingCompetitions(function (rsl, err) {
        if (err) {
            res.send(400, { 'success': false, 'error': req.url, 'message': err});
        } else {
            res.send({ 'success': true, 'result': rsl});
        }
    })
});

router.get('/competition', function (req, res) {
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
});

router.get('/user/login', user_api.get_user_data);
router.post('/user/login', user_api.login);
router.post('/user/logout', user_api.logout);
router.post('/user/register', user_api.register);

module.exports = router;