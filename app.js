/*jslint node:true*/
/*eslint-env node*/
'use strict';
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport'); 
const exphbs = require ('express-handlebars');
const hbsHelpers = require('./app_server/helpers/hbsHelpers');

require('./app_api/models/db');
require('./app_api/config/passport');
var indexRouter = require('./app_server/routes/index');
//var usersRouter = require('./app_server/routes/users');

var apiRouter = require('./app_api/routes/index');

var app = express();

// view engine setup
/* old JADE setup 
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');
*/
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.engine('handlebars',exphbs({
  defaultLayout: "main",
  helpers: hbsHelpers
})); 
app.set('view engine','handlebars');
//app.locals.layout =

app.use(logger('dev'));
//3avr. todo : utilisé body parser? ou extended true for parsing nested objects
app.use(express.json()); // for parsing "application/json"
app.use(express.urlencoded({ extended: false})); // for parsing "application/x-www-form-urlencoded"
 // https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0 
//https://www.twilio.com/blog/2016/07/how-to-receive-a-post-request-in-node-js.html
app.use(bodyParser.text()); // to parse http post text/plain (content-type  )
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));


// session is optional ! (express & passport : mais permet d'identifier avec un cookie unique les req. utilisateurs plutot qu'avec les credentials) 
app.use(session({secret: 'secret used to sign the session ID cookie', resave: true, saveUninitialized: false }));
// https://www.npmjs.com/package/express-session 
// sitepoint example met les 2 a false // resave si 'touch' method implémentée 
// todo choose resave option "How do I know if this is necessary for my store? The best way to know is to check with your store if it implements the touch method. If it does, then you can safely set resave: false. If it does not implement the touch method and your store sets an expiration date on stored sessions, then you likely need resave: true."
app.use(passport.initialize()) ; 
app.use(passport.session()); 


//routes
app.use('/', indexRouter);
app.use('/api/v0', apiRouter);
//app.use('/users', usersRouter);

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
