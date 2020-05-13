/*jslint node:true*/
/*eslint-env node*/

/**********************/
/*      Require       */
/**********************/
            /******* Express ******/
var express = require('express');
var router = express.Router();
            /******* Controllers ******/
var ctrlLive = require('../controllers/live');
var ctrlIndex = require('../controllers/index');
var ctrlHistory = require('../controllers/history'); 
var ctrlAbout = require ('../controllers/about'); 
/*var ctrlAdmin = require('../controllers/admin');*/
var ctrlAuth = require('../controllers/auth');

            /******* For authentication ******/
// PASSPORT & LOGIN
var passport = require('passport'); 
const connectEnsureLogin = require('connect-ensure-login');


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

/********* Export ********/
module.exports = router;