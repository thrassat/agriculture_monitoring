var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
const {user} = require('../models/user'); 

passport.use(user.createStrategy());
//mherman passport.use(users.autenticate()); 
passport.serializeUser(user.serializeUser()); 
passport.deserializeUser(user.deserializeUser()); 


/* Old version 
passport.use(new LocalStrategy({
    usernameField: 'email' // redefine common username field to use email instead
    // todo : use both? 
},

function (username, password, done) {
    User.findOne({ email: username}, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, {
                message: 'Incorrect username/email.'
            });
        }
        if (!user.validPassword(password)) {
            return done(null, false, {
                message: 'Incorrect password.'
            });
        }
        return done(null,user); 
    });
}
));
*/