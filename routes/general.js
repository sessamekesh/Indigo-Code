/**
 * Created by Kamaron on 4/21/2015.
 *
 * General route - provides a middleware that prefaces the loading of any general
 *  page. All competition pages and problem pages must also pass through
 *  general route - so here goes anti-DOS, user blacklisting, etc.
 */

var express = require('express'),
    competition_router = require('./competition'),
    user_router = require('./user'),
    admin_router = require('./admin');

var router = express.Router();

router.use('/', function (req, res, next) {
    // General page restrictions go here...
    next();
});

// Anything under directory '/competition' goes to competition router
router.use('/competition', competition_router);

// Anything under directory '/user' goes to user router
router.use('/user', user_router);

// Anything under directory '/admin' goes to admin router
router.use('/admin', admin_router);

// Add router endpoints here...
// TODO: Move endpoints to controllers...
router.get('/', function (req, res) {
    res.send('fooyeah');
});

module.exports = router;