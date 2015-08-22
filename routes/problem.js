/**
 * Created by Kamaron on 4/21/2015.
 */

var express = require('express');
var fs = require('fs');
var problemDao = require('../dao/problem_dao');
var ProblemData = problemDao.ProblemData;

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // Competition restrictions go here...

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('Problem ID ' + req.params.id + ' is not valid!');
    } else {
        console.log('For problem ' + req.params.id + '!');

        var problemId = req.params.id;

        problemDao.getProblemData(problemId, function (daoErr, daoRes) {
            if (daoErr) {
                // TODO KAM: Secure this, don't send error messages to the user
                console.log('Failed to get problem data: ' + daoErr);

                // TODO KAM: Remember, you can't throw exceptions...
                throw daoErr;
            } else {
                req.problemData = daoRes;
                next();
            }
        });
    }
});

// Add router endpoints here...
var controllers = fs.readdirSync(__dirname + '/../controllers/problem');
for (var i = 0; i < controllers.length; i++) {
    var cl = require('../controllers/problem/' + controllers[i]);
    if (Object.prototype.toString.call(cl.get) === '[object Function]') {
        router.get('/:id/' + controllers[i].substring(0, controllers[i].length - 3), cl.get);
        if (controllers[i] === 'index.js') {
            router.get('/:id/', cl.get);
        }
    }

    if (Object.prototype.toString.call(cl.post) === '[object Function]') {
        router.post('/:id/' + controllers[i].substring(0, controllers[i].length - 3), cl.post);
        if (controllers[i] === 'index.js') {
            router.post('/:id/', cl.post);
        }
    }
}

module.exports = router;