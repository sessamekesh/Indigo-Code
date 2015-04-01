/**
 * Created by kamaron on 3/31/15.
 */
var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    console.log('User section activated...');
    next();
});

router.get('/', function (req, res, next) {
    res.send('Root user page activated.');
});

router.get('/foo', function (req, res, next) {
    res.send('Foo user page activated.');
});

module.exports = router;