/**
 * Created by Kamaron on 4/22/2015.
 */

var express = require('express');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // User access restrictions go here...

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('User ID ' + req.params.id + ' is not valid!');
    } else {
        console.log('For user ' + req.params.id + '!');
        next();
    }
});

// Add router endpoints here...
// TODO: Move endpoints to controllers...
router.get('/', function (req, res) {
    throw new Error('No user specified!');
});

router.post('/login', function (req, res) {
    res.send('Login invoked!');
});

router.post('/logout', function (req, res) {
    res.send('Logout invoked!');
});

router.post('/register', function (req, res) {
    res.send('Register invoked!');
});

router.get('/:id', function (req, res) {
    res.send('Endpoint for user ' + req.params.id);
});

module.exports = router;