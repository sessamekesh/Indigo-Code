var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var index_data_loader = require('./controllers/general/index');

var general_route = require('./routes/general');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'rigg-sessamekesh', resave: false, saveUninitialized: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// error handlers
if (app.get('env') === 'development') {
  // Jade - force to render pretty, we don't yet want to obfuscate our code.
  app.locals.pretty = true;

  // Development error handler - will print stack trace
  app.use(function(err, req, res, next) {
    index_data_loader.fill_data(req, { message: err.message, error: err }, function (new_data) {
      res.status(err.status || 500);
      res.render('error', new_data);
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    index_data_loader.fill_data(req, { message: err.message, error: {} }, function (new_data) {
      res.status(err.status || 500);
      res.render('error', new_data);
    });
  });
}

// Router setup...
app.use('/', general_route);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
