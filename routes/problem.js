/**
 * Created by Kamaron on 4/21/2015.
 */

var express = require('express');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // Competition restrictions go here...

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('Problem ID ' + req.params.id + ' is not valid!');
    } else {
        console.log('For problem ' + req.params.id + '!');
        next();
    }
});

// Add router endpoints here...
// TODO: Move endpoints to controllers...
router.get('/', function (req, res) {
    throw new Error('No problem specified!');
});

router.get('/:id', function (req, res) {
    res.send('Endpoint for problem ' + req.params.id);
});

module.exports = router;