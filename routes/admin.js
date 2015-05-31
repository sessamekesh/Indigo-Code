/**
 * Created by Kamaron on 4/22/2015.
 */

var express = require('express');
var fs = require('fs');
var user_dao = require('../dao/user_dao');

var router = express.Router();

/**
 * General restrictions for the admin section go in here...
 */
router.use('/', function (req, res, next) {
    // General page restrictions go here...

    /** @type {user_dao.UserData} */
    var user_data = req.session.user_data;

    if (true || user_data && user_data.is_admin) {
        req.user_data = user_data;
        next();
    } else {
        throw new Error('This section is off limits to all but site admins');
    }
});

// Add router endpoints here...
var controllers = fs.readdirSync(__dirname + '/../controllers/admin');
for (var i = 0; i < controllers.length; i++) {
    var cl = require('../controllers/admin/' + controllers[i]);
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