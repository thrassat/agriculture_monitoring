var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
const {user} = require('../models/user'); 

passport.use(user.createStrategy());
//mherman passport.use(users.autenticate()); 
passport.serializeUser(user.serializeUser()); 
passport.deserializeUser(user.deserializeUser()); 

