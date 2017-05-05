var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
var mongoose = require('mongoose');
var passport = require('passport');


var index = require('./routes/index');
var news = require('./routes/news');
var auth = require('./routes/auth');
var app = express();

var config = require('../../config/config.json');
require('./models/main.js').connect(config.mongoDb.userInfoMongoDbUri)

// view engine setup
app.set('views', path.join(__dirname, '../client/build/'));
app.set('view engine', 'jade');
app.use('/static', express.static(path.join(__dirname, '../client/build/static')));

app.use(cors());
app.use(bodyParser.json());

app.use(passport.initialize());
var localSignupStrategy = require('./passport/signup_passport.js');
var localLoginStrategy = require('./passport/login_passport.js');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

var authchecker = require('./middleware/auth_checker');

app.use('/', index);
app.use('/news', authchecker);
app.use('/news', news);
app.use('/auth', auth);
 
// error handler
app.use(function(err, req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.send('404 not found');
});

module.exports = app;
