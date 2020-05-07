/*jslint node:true*/
/*eslint-env node*/

var express = require('express');
var router = express.Router();
var ctrlLive = require('../controllers/live');
var ctrlIndex = require('../controllers/index');
var ctrlHistory = require('../controllers/history'); 
var ctrlAbout = require ('../controllers/about'); 
/*var ctrlAdmin = require('../controllers/admin');*/

// PASSPORT & LOGIN
var passport = require('passport'); 
const connectEnsureLogin = require('connect-ensure-login');
var ctrlAuth = require('../controllers/auth');

/**********************/
/* Pages CONSULTATION */
/**********************/
router.get('/',connectEnsureLogin.ensureLoggedIn(),ctrlIndex.listAccessibleSensorGroups);
router.get('/live/:groupid',connectEnsureLogin.ensureLoggedIn(),ctrlLive.displayLiveDatas);
router.get('/history/:sensorid',connectEnsureLogin.ensureLoggedIn(), ctrlHistory.displayDatasHistory); 

/**********************/
/*   Pages ADMIN      */
/**********************/

/**********************/
/*  Pages CONNECTION  */
/**********************/
// authenticate
router.post('/login',ctrlAuth.auth); 
// send the login page
router.get('/login',ctrlAuth.displayLogin); 
//EXAMPLES :
// todo ad ensureLoggedIn sur les différentes routes?
// add to our route
// router.get('/', 
//   connectEnsureLogin.ensureLoggedIn(),
//   (req, res) => res.sendFile('html/index.html', {root: __dirname})
// );

router.post('/register', ctrlAuth.register);
router.get('/register',ctrlAuth.displayRegister);

router.get('/logout', ctrlAuth.logout);
// examples 
router.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);


/**********************/
/*  Pages AUTRES      */
/**********************/
router.get('/about/',ctrlAbout.renderAbout);

module.exports = router;