var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello, world!', subtitle: 'Zora: Prototype 0.3', user_data: req.session.user_data, redirect_url: '/' });
});

router.get('/about', function (req, res) {
    res.render('about', { title: 'About', subtitle: 'Zora: Prototype 0.3', user_data: req.session.user_data, redirect_url: '/about' });
});

router.get('/register', function (req, res) {
    res.render('register', { title: 'Register for Competition', subtitle: 'Zora: Prototype 0.3', user_data: req.session.user_data, redirect_url: '/' });
});

router.get('/register/:id', function (req, res) {
    res.send('ID requeseted: ' + req.params.id);
});

router.get('/session_data', function (req, res, next) {
    res.send(req.session);
});

module.exports = router;
