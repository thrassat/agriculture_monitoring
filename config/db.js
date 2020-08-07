/*jslint node:true*/
/*eslint-env node*/
'use strict';
//possible to use multi DB
/**********************************************/
/*          DATABASE CONNECTION FILE          */
/**********************************************/
var mongoose = require('mongoose');
var closeCon; 

/*************** SETUP DB URI ************************/
var dbURI = 'mongodb://localhost/AU_datas';

/* entrer ici les informations pour une connexion a une base de données de production (pas en local) */ 
if(process.env.NODE_ENV === 'production') {
    console.log("NODE_ENV : "+ process.env.NODE_ENV + " // Mode production actif");
    console.log(process.env.MONGOLAB_URI);
    dbURI = process.env.MONGOLAB_URI ;
}

/*************** CONNECT DB VIA MONGOOSE ************************/
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

/*************** DEBUG ************************/
mongoose.connection.on('connected', function () {
console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
console.log('Mongoose disconnected');
});

/*************** Closing connection ************************/
closeCon = function (msg, callback) {
    mongoose.connection.close(function () { 
        console.log('Mongoose disconnected through '+msg); 
        callback();
    });
}; 
/* Call closeCon function */
//For nodemon restarts
process.once('SIGUSR2', function () {
    closeCon('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});

//For app termination
process.on('SIGINT', function () {
    closeCon('app termination', function() {
        process.exit(0);
   });
});

//For Heroku app termination
process.on('SIGTERM', function() {
    closeCon('Heroku app shutdown', function() {
        process.exit(0);
    });
});


// Mongoose schema
require('../models/sensorGroup')
require('../models/userGroup'); 
require('../models/user'); 
require('../models/token')
