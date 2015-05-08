/**
 * Created by Kamaron on 4/21/2015.
 */

var express = require('express'),
    problem_router = require('./problem'),
    fs = require('fs');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // Competition restrictions go here...

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('Competition ID ' + req.params.id + ' is not valid!');
    } else {
        console.log('For competition ' + req.params.id + '!');
        next();
    }
});

// Anything under directory '/problem' goes to problem router
router.use('/:id/problem', problem_router);

// Add router endpoints here...
var controllers = fs.readdirSync(__dirname + '/../controllers/competition');
for (var i = 0; i < controllers.length; i++) {
    var cl = require('../controllers/competition/' + controllers[i]);
    if (Object.prototype.toString.call(cl.get) === '[object Function]') {
        router.get('/' + controllers[i].substring(0, controllers[i].length - 3), cl.get);
        if (controllers[i] === 'index.js') {
            router.get('/', cl.get);
        }
    }

    if (Object.prototype.toString.call(cl.post) === '[object Function]') {
        router.post('/' + controllers[i].substring(0, controllers[i].length - 3), cl.post);
        if (controllers[i] === 'index.js') {
            router.post('/', cl.post);
        }
    }
}

module.exports = router;