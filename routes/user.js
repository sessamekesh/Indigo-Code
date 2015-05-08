/**
 * Created by Kamaron on 4/22/2015.
 */

var express = require('express'),
    fs = require('fs');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // If the user ID given is indeed a number, make sure that the
    //  requested operation is allowed - which is only in one of two cases:
    // 1) The visitor is an admin
    // 2) The visitor is the user with the given user ID

    if (isNaN(parseInt(req.params.id || {}))) {
        // If not a number, we're accessing a non-sensitive operation, allow.
        next();
    } else {
        if (req.session.user_data === undefined) {
            throw new Error('Must be logged in to access restricted user section');
        } else if (req.session.user_data.user_id !== req.params.id && req.session.user_data.is_admin !== true) {
            throw new Error('User information requested is not your own - must be an admin to access another user\'s information');
        } else {
            // Visitor is admin or appropriate user, allow access.
            next();
        }
    }
});

// Add router endpoints here...
var controllers = fs.readdirSync(__dirname + '/../controllers/user');
for (var i = 0; i < controllers.length; i++) {
    var cl = require('../controllers/user/' + controllers[i]);
    if (Object.prototype.toString.call(cl.get) === '[object Function]') {
        router.get('/' + controllers[i].substring(0, controllers[i].length - 3), cl.get);
        console.log('/' + controllers[i].substring(0, controllers[i].length - 3));
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