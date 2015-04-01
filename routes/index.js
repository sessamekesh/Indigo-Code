var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Hello, world!', subtitle: 'Zora: Prototype 0.3' });
});

router.get('/session_data', function (req, res, next) {
    res.send(req.session);
});


module.exports = router;
