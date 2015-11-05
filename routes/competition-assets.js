/**
 * Created by Kamaron on 4/21/2015.
 */

var express = require('express');
var fs = require('fs');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // Grab, if exists, from the appropriate location.
    fs.stat('./data/competition-assets/' + req.comp_data.id + '/' + req.params.id, function (serr, sres) {
        if (serr || !sres.isFile()) {
            var e = new Error('Could not find requested resource');
            res.render('./error', {'error': e, 'message': e.message});
        } else {
            res.sendfile('./data/competition-assets/' + req.comp_data.id + '/' + req.params.id);
        }
    });
});

module.exports = router;