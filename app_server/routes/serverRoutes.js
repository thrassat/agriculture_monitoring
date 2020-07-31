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
var ctrlGestCapteurs = require('../controllers/gestCapteurs');
var ctrlAuth = require('../controllers/auth');
var ctrlSetup = require('../controllers/setup')
// USERS
var ctrlComptes = require('../controllers/gestCompt');
var ctrlAccountCreator = require('../controllers/accountCreator'); 
var ctrlDeleter = require('../controllers/deleter');
var ctrlParamComptes = require('../controllers/paramCompt');
var ctrlUserValidation = require('../controllers/accountValidator');
// reset pwd (improvement)
// var ctrlResetPwd = require('../controllers/resetPwd')
// USER GROUPS 
var ctrlUserGroupCreator = require('../controllers/userGroupCreator')
var ctrlParamUserGroup = require('../controllers/paramUserGroup')
// EXTERNAL FUNCTIONS (SECURE ROUTES)
var helpers = require('../helpers/jsHelpers')

/****** FORMAT ********** ***********************/
/* nom-de-la-vue : rapidement a quoi elle sert */
/***********************************************/
// get
// eventuels post 
 
/******************************************************************************************************************************/
/*                                           Pages CONSULTATION                                                               */
/******************************************************************************************************************************/
/************************************************************/
/* index/accueil : accès aux différents groupes de capteurs */
/************************************************************/
router.get('/', helpers.isLoggedIn , ctrlIndex.renderIndexWithDatas); //ok 
/**********************************/
/* live : données en "temps réel" */
/**********************************/
router.get('/live/:groupId',helpers.isLoggedInAndHasAccess,ctrlLive.renderLiveWithDatas); //ok 
/***************************************/
/* historic : historique des données   */
/***************************************/
router.get('/historic/:groupId',helpers.isLoggedInAndHasAccess,ctrlHistory.displayDatasHistory) //ok 
// request from AJAX front-end //ok 
//router.get('/historic/:groupId/:sensorId',helpers.isLoggedInAndHasAccess,ctrlHistory.getDatas) //ok 
router.get('/historic/:groupId/:sensorId',helpers.isLoggedInAndHasAccess,ctrlHistory.fetchFromTo) 
/******************************************************************************************************************************/
/*                                           Pages d'ADMINISTRATION                                                           */
/******************************************************************************************************************************/

/************************************************ GESTION DES CAPTEURS ********************************************************/
/************************************************************************************************************************/
/* gestion-capteurs : page affichant les différents groupes de capteurs et permettant leur confirmation et paramétrage  */
/*************************************************************************************************************************/
router.get('/gestion-capteurs',helpers.isLoggedInAndHasAdminRole,ctrlGestCapteurs.renderAdminWithDatas); //ok 
/***************************************************************************************************************************/
/* param-compte : page affichant le paramétrage d'un groupes de capteurs et ses capteurs et permettant leurs confirmations */
/***************************************************************************************************************************/
router.get('/setup/:groupId',helpers.isLoggedInAndIsAdmin,ctrlSetup.renderSetupWithDatas);// HTTP POST modification/confirmation d'un capteur
// HTTP POST modification/confirmation d'un capteur 
router.post('/setup/:groupId/:sensorId', helpers.isLoggedInAndIsAdmin, ctrlSetup.renderPostSensor);
// HTTP POST modification/confirmation d'un groupe de capteurs
router.post('/setup/:groupId', helpers.isLoggedInAndIsAdmin, ctrlSetup.renderPostSetup); 

// SUPPRESSIONS A AMELIORER (faire comme pour un compte utilisateur)
// pour un sensorgroup
router.post('/delete/:groupId',helpers.isLoggedInAndIsAdmin,ctrlDeleter.deleteGroup)
// pour un usergroup [only superadmin]
router.post('/delete/usergroup/:groupname',helpers.isLoggedInAndIsSuperAdmin,ctrlDeleter.deleteUserGroup)
// old corrigé router.post('/delete/user/:email',ctrlDeleter.deleteUserAccount)

/************************************************ GESTION DES COMPTES ********************************************************/
/**************************************************************************************************************************/
/* gestion-comptes : page affichant les différents comptes utilisateurs permettant leur paramétrage pour les super admin  */
/**************************************************************************************************************************/
router.get('/gestion-comptes',helpers.isLoggedInAndHasAdminRole,ctrlComptes.displayGestCompt); //ok
/*********************************************************************************/
/* new-user : page affichant le formulaire pour créer un nouveau compte         */
/********************************************************************************/
router.get('/gestion-comptes/new-user',helpers.isLoggedInAndHasAdminRole,ctrlAccountCreator.displayNewUser) // ok 
// HTTP POST handler créatiion du nouveau compte
router.post('/gestion-comptes/new-user',helpers.isLoggedInAndHasAdminRole,ctrlAccountCreator.newUserFormHandler) // ok 

/********************************************************************************************************************************/
/* new-user-group : page affichant le formulaire pour créer un nouveau groupe d'utilisateurs (nom, accès, administration)       */
/* [only superadmin]                                                                                                            */
/*********************************************************************************************************************************/
router.get('/gestion-comptes/new-user-group',helpers.isLoggedInAndIsSuperAdmin,ctrlUserGroupCreator.displayNewUserGroup) //ok
router.post('/gestion-comptes/new-user-group',helpers.isLoggedInAndIsSuperAdmin,ctrlUserGroupCreator.newUserGroupFormHandler) //ok
/****************************************************************************************************************************/
/* param-usergroup : page affichant le formulaire pour modifier un groupe d'utilisateurs (nom, accès, administration)       */
/*[only superadmin]                                                                                                         */  
/**************************************************************************** ***********************************************/
router.get('/gestion-comptes/group/:groupname',helpers.isLoggedInAndIsSuperAdmin,ctrlParamUserGroup.displayParamUserGroup) //ok
router.post('/gestion-comptes/group/:groupname',helpers.isLoggedInAndIsSuperAdmin,ctrlParamUserGroup.postUserGroupParam) //ok

/**************************************************************************************************************************************/
/* param-compte : page affichant le formulaire pour modifier/supprimer un compte utilisateur (groupe, role, accès, administration)    */
/*[only superadmin]                                                                                                                   */  
/**************************************************************************************************************************************/
router.get('/gestion-comptes/:username',helpers.isLoggedInAndIsSuperAdmin,ctrlParamComptes.displayParamCompt) //ok 
router.post('/gestion-comptes/update-user/:username',helpers.isLoggedInAndIsSuperAdmin,ctrlParamComptes.postUserParam) //ok  
router.post('/gestion-comptes/delete-user/:email',helpers.isLoggedInAndIsSuperAdmin,ctrlParamComptes.deleteUserAccount) //ok

/***************************************************************************************************************************************************/
/* account-validator : page affichant la création/modification du nom utilisateur, lien reçu par email par l'user, token a expiration sous 24heures*/
/***************************************************************************************************************************************************/
// pas de besoin d'être connecté (car confirmation de comptes), sécurisé via le token
router.get('/gestion-comptes/new-user/:token', ctrlUserValidation.displayUserValidation); //ok 
router.post('/gestion-comptes/validate-user/:token', ctrlUserValidation.postUserValidation); //ok 
// reset pwd // potentiellement à améliorer : bypass avec le account validator et ?reset=true en paramètre
// pour améliorer router.get('/gestion-comptes/new-user/:token', ctrlUserValidation.displayResetPwd);

/*************************************************************************************************************/
/*                                    Pages CONNECTION                                                       */
/*************************************************************************************************************/
/***************************************************************************/
/* login : page affichant le formulaire de connexion (username/password)  */
/**************************************************************************/
router.get('/login',ctrlAuth.displayLogin);  //ok 
router.post('/login',ctrlAuth.auth); //ok 

/*****************************************************************/
/* logout : fin de session et redirection vers la page de login  */
/*****************************************************************/
router.get('/logout',helpers.isLoggedIn,ctrlAuth.logout); //ok 

/************************************************************************************************************/
/*                                      Pages AUTRES                                                        */
/************************************************************************************************************/
router.get('/about/',helpers.isLoggedIn,ctrlAbout.renderAbout); //ok 

/********* Export ********/
module.exports = router;

  /******* For authentication ******/
// // PASSPORT & LOGIN
// var passport = require('passport'); 
// //old const connectEnsureLogin = require('connect-ensure-login');


/// TMP 
// router.get('/bulma', function (req,res) {
//   res.render("bulmatest")
// });

// // test loggin : 

// /* from https://auth0.com/blog/create-a-simple-and-secure-node-express-app/ */
// const secured = (req, res, next) => {
//   if (req.user) {
//     return next();
//   }
//   req.session.returnTo = req.originalUrl;
//   res.redirect("/login");
// };

// // Simple route middleware to ensure user is authenticated.
// // from https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb   
// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) { return next(); }
//   req.session.error = 'Please log in!';
//   res.redirect('/login');
// }