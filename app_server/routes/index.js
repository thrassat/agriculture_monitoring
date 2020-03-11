/*jslint node:true*/
/*eslint-env node*/

var express = require('express');
var router = express.Router();
var ctrlConsultation = require('../controllers/consultation');

/*var ctrlAdmin = require('../controllers/admin');
var ctrlAuth = require('../controllers/auth');*/
var ctrlOthers = require('../controllers/others');

/* Consultation pages */
router.get('/', ctrlConsultation.livedata);
router.get('/historic', ctrlConsultation.historic);

/* Page de gestion/administration todo */ 

/* Page de connection todo */ 
/* Other pages */
router.get('/about', ctrlOthers.about);

module.exports = router;
