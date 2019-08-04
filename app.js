var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session)

require('dotenv').config()


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
mongoose.connect(process.env.DB_CON_STR, {
  useNewUrlParser: true
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;


function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({
  secret: process.env.APP_SECRET,
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db })
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;