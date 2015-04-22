/**
 * Created by Kamaron on 4/22/2015.
 */

var express = require('express'),
    fs = require('fs');

var router = express.Router();

router.use('/:id', function (req, res, next) {
    // User access restrictions go here...

    // ID must be an integer...
    if (isNaN(parseInt(req.params.id || {}))) {
        throw new Error('User ID ' + req.params.id + ' is not valid!');
    } else {
        console.log('For user ' + req.params.id + '!');
        next();
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