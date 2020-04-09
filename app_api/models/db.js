/*jslint node:true*/
/*eslint-env node*/
'use strict';
//possible to use multi DB

// Fichier de connection à la base de donnée

var mongoose = require('mongoose');
var closeCon; 
var dbURI = 'mongodb://localhost/AU_datas';

if(process.env.NODE_ENV === 'production') {
    console.log("NODE_ENV : "+ process.env.NODE_ENV + " // Mode production actif");
    console.log(process.env.MONGOLAB_URI);
    dbURI = process.env.MONGOLAB_URI ;
}

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

/* debug */
mongoose.connection.on('connected', function () {
console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
console.log('Mongoose disconnected');
});

/* Closing connection */
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
/* test */
// todo add new ones ? sensorGroup & storedDatas
require('./consultation');
require('./user');
require('./userGroup'); 

/* Example from MongoDB website 

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://teow:<password>@cluster0-t7inc.azure.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/