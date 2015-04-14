/**
 * Created by kamaron on 4/14/15.
 */

'use strict';

var express = require('express'),
    competition_dao = require('../dao/competition_dao');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    console.log('------------------------------- GATEKEEPER -------------------------------');

    var user_data = req.session.user_data;

    if (user_data === undefined) {
        console.log('-- FILTHY GUEST');
    } else {
        console.log('-- ' + (user_data.is_admin ? 'SIR ' + user_data.user_name : user_data.user_name + ' THE PEASANT'));
    }
    console.log('-- Requesting access to competition: ' + req.params.id);
    console.log('--------------------------- JUDGE WISELY OH THOU HOLY JUDGE ---------------------------');

    competition_dao.getCompetitionData(req.params.id, function (rsl, err) {
        if (err) {
            console.log('competition.js: Failed to get competition data on grounds ' + err);
            res.status(500).render('error_page', { message: 'Could not get competition data - ' + err.message, user_data: req.session.user_data, redirect_url: '/competition/' + req.params.id });
        } else {
            if (rsl) {
                var auth_function;
                if (user_data === undefined) {
                    auth_function = auth_guest;
                } else if (user_data.is_admin) {
                    auth_function = auth_admin;
                } else {
                    auth_function = auth_peasant;
                }

                auth_function(rsl, function (decision) {
                    if (decision === true) {
                        next();
                    } else {
                        res.status(403).render('error_page', { message: 'Access denied - ' + decision, user_data: req.session.user_data, redirect_url: '/competition/' + req.params.id });
                    }
                });
            } else {
                res.status(500).render('error_page', { message: 'No competition with given ID found', user_data: req.session.user_data, redirect_url: '/competition/' + req.params.id });
            }
        }
    });
});

router.get('/:id/*', function (req, res) {
    res.send('You have reached the competition subsystem ' + req.params.id);
});

module.exports = router;

var auth_peasant = function (compData, cb) {
    // TODO KIP: Replace with actual authorization logic
    cb('This feature has not yet been finalized for non-administrative users');
};

var auth_admin = function (compData, cb) {
    // Of course, sir. Right this way.
    cb(true);
};

var auth_guest = function (compData, cb) {
    // TODO KIP: Replace with actual authorization logic
    cb('No filthy guests are allowed yet');
};