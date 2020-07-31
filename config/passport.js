var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
const {user} = require('../models/user'); 

passport.use(user.createStrategy());
//mherman passport.use(users.autenticate()); 
passport.serializeUser(user.serializeUser()); 
passport.deserializeUser(user.deserializeUser()); 

/* Stephane config : 
"use strict";

var passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    User = require("mongoose").model('User');


module.exports = function (passport) {

    console.log("Configuration de Passport");

    // *******************************************************
    // Pour la gestion des sessions...
    // *******************************************************
Avec ces deserialize la on utilise le id mongooose 
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // *******************************************************
    // Configuration de la stratégie
    // *******************************************************


    // Signup
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            User.findOne({
                'email': email
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                }
                // Création
                var newUser = new User();
                newUser.generateHash(password,function (err, hash) {
                    newUser.email = email;
                    newUser.password = hash;
                    newUser.save(function (err) {
                        if (err) return done(null, false, req.flash('signupMessage', 'Invalid email.'));
                        return done(null, newUser);
                    });
                });
            })
        }));



    // Login
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            User.findOne({
                'email': email
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }
                user.validPassword(password,function (err, valid) {
                    if (!valid) {
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    }
                    return done(null, user);

                })
            });

        }));

};
*/ 