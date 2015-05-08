/**
 * Created by Kamaron on 4/22/2015.
 */

var express = require('express'),
    fs = require('fs');

var router = express.Router();

router.use('/', function (req, res, next) {
    // General page restrictions go here...
    next();
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