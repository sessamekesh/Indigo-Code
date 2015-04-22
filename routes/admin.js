/**
 * Created by Kamaron on 4/22/2015.
 */

var express = require('express');

var router = express.Router();

router.use('/', function (req, res, next) {
    // General page restrictions go here...
    next();
});

// Add router endpoints here...
// TODO: Move endpoints to controllers...
router.get('/', function (req, res) {
    res.send('fooyeah');
});

module.exports = router;