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
    admin_router = require('./admin'),
    fs = require('fs');

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
var controllers = fs.readdirSync(__dirname + '/../controllers/general');
for (var i = 0; i < controllers.length; i++) {
    var cl = require('../controllers/general/' + controllers[i]);
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