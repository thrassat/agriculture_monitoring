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
var ctrlAdmin = require('../controllers/admin');
var ctrlAuth = require('../controllers/auth');
var ctrlSetup = require('../controllers/setup')
var ctrlPostSetup = require('../controllers/postSetup');
            /******* For authentication ******/
// PASSPORT & LOGIN
var passport = require('passport'); 
const connectEnsureLogin = require('connect-ensure-login');

/// TMP 
router.get('/bulma', function (req,res) {
  res.render("bulmatest")
});

// test loggin : 

/* from https://auth0.com/blog/create-a-simple-and-secure-node-express-app/ */
const secured = (req, res, next) => {
  if (req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

// Simple route middleware to ensure user is authenticated.
// from https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb   
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please log in!';
  res.redirect('/login');
}
 
function isLoggedIn(req,res,next) {
  //if user is authenticated in the session, carry on 
  console.log(req.user);
  console.log(req.session); 
  if (req.isAuthenticated()) {
    return next() ; 
  }
  // if they aren't redirect them to the home page
  res.redirect("/login"); 
}

// check ça https://blog.soshace.com/implementing-role-based-access-control-in-a-node-js-application/ 
//ça https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api

/**********************/
/* Pages CONSULTATION */
/**********************/
router.get('/', isLoggedIn , ctrlIndex.renderIndexWithDatas);
router.get('/live/:groupid',connectEnsureLogin.ensureLoggedIn(),ctrlLive.renderLiveWithDatas);
// pour le moment juste historique sur une grandeur : possibilité de générer pour plusieurs todo 
router.get('/history/:sensorid',connectEnsureLogin.ensureLoggedIn(), ctrlHistory.displayDatasHistory); 

/**********************/
/*   Pages ADMIN      */
/**********************/
router.get('/admin',connectEnsureLogin.ensureLoggedIn(),ctrlAdmin.renderAdminWithDatas);
router.get('/setup/:groupId',connectEnsureLogin.ensureLoggedIn(),ctrlSetup.renderSetupWithDatas);
router.post('/setup/test',connectEnsureLogin.ensureLoggedIn(),ctrlPostSetup.postSetupHandler);  
//router.post('/setup2/:sensorid', connectEnsureLogin.ensureLoggedIn, ctrlSetup.renderPostSensor);
router.post('/setup/:groupId/:sensorId', connectEnsureLogin.ensureLoggedIn(), ctrlSetup.renderPostSensor);
router.post('/setup/:groupId',connectEnsureLogin.ensureLoggedIn(), ctrlSetup.renderPostSetup); 

router.post('/test/:test1/:test2', function (req,res) { res.render("setup", {title:"OK"}); console.log("hola")});
router.post('/test/:test1',function (req,res) { res.render("setup", {title:"KO"}); console.log("yoo") });
//router.post('/setup')
/**********************/
/*  Pages CONNECTION  */
/**********************/
// authenticate
// function (req, res) { console.log(req._passport.instance)} to test 
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