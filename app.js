var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var bodyParser = require('body-parser');
var session = require('express-session');
var index_data_loader = require('./controllers/general/index');
var multer = require('multer');
var config = require('./config');

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
app.use(multer({
  dest: './uploads/',
  limits: {
    fields: 200,
    fileSize: config.maxFileSize
  }
}));
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

// TODO KAM: Remove this, this is horrible. This is horrible. Use only for debugging.
var BuildServerManager = require('./buildServerManager/BuildServerManager').BuildServerManager;
var BuildServer = require('./buildServerManager/models/BuildServer').BuildServer;
var t = new BuildServer('localhost', 8080, 1, function (err) {
  if (err) {
    console.log('Error connecting to build server - ' + JSON.stringify(err));
  } else {
    BuildServerManager.registerBuildServer(t, function (err2) {
      if (err2) {
        console.log('Error registering build server - ' + JSON.stringify(err2));
      }
    });
  }
});

// Make sure all of our data directories exist...
function makeSureDirectoryExists(path) {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code != 'EEXIST'){
      throw e;
    }
  }
}

makeSureDirectoryExists('./data');
makeSureDirectoryExists('./data/test-cases');
makeSureDirectoryExists('./data/sample-solutions');
makeSureDirectoryExists('./data/build-packages');
makeSureDirectoryExists('./views/problem/descriptions');

module.exports = app;
