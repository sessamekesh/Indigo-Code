var express = require('express');
var router = express.Router();

var competition_dao = require('../dao/competition_dao');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Hello, world!', subtitle: 'Zora: Prototype 0.3', user_data: req.session.user_data, redirect_url: '/' });
});

router.get('/about', function (req, res) {
    res.render('about', { title: 'About', subtitle: 'Zora: Prototype 0.3', user_data: req.session.user_data, redirect_url: '/about' });
});

router.get('/register', function (req, res) {
    res.render('register', { title: 'Register for Competition', subtitle: 'Zora: Prototype 0.3', user_data: req.session.user_data, redirect_url: '/register' });
});

router.get('/register/:id', function (req, res) {
    console.log('Registering for competition ' + req.params.id);

    competition_dao.getCompetitionData(req.params.id, function (rsl, err) {
        if (err) {
            res.status(500).render('error_page', { message: err.toString() });
        } else {
            res.render('register', {
                title: 'Register for competition',
                subtitle: 'Zora: Prototype 0.3',
                user_data: req.session.user_data,
                redirect_url: '/register/' + rsl.id,
                comp_data: rsl,
                include_scripts: [{'src': '/js/angular-route.min.js'}]
            });
        }
    });
});

router.get('/session_data', function (req, res, next) {
    res.send(req.session);
});

module.exports = router;
