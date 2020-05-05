/*jslint node:true*/
/*eslint-env node*/

var express = require('express');
var router = express.Router();
var ctrlLive = require('../controllers/live');
var ctrlIndex = require('../controllers/index');
var ctrlHistory = require('../controllers/history'); 
var ctrlAbout = require ('../controllers/about'); 

/*var ctrlAdmin = require('../controllers/admin');
var ctrlAuth = require('../controllers/auth');*/

/**********************/
/* Pages CONSULTATION */
/**********************/
router.get('/',ctrlIndex.listAccessibleSensorGroups);
router.get('/live/:groupid',ctrlLive.displayLiveDatas);
router.get('/history/:sensorid', ctrlHistory.displayDatasHistory); 

router.get('/datastest/',ctrlHistory.displayDatasHistory)
/**********************/
/*   Pages ADMIN      */
/**********************/

/**********************/
/*  Pages CONNECTION  */
/**********************/

/**********************/
/*  Pages AUTRES      */
/**********************/
router.get('/about/',ctrlAbout.renderAbout);

module.exports = router;
