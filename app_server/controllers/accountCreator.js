const {user} = require('../../models/user') ; 
const {sensorGroup} = require('../../models/sensorGroup')
const {token} = require('../../models/token')
const {userGroup} = require ('../../models/userGroup');
const validator = require('express-validator');
const { body } = require('express-validator');
const mailer = require('../helpers/mailer');
const mongoose = require('mongoose'); 
//var logger = require('morgan')


/*************** Render & datas ***************/
var renderNewUser = function (req,res,confirmedGroupNames,userGroups,formErrors, mongooseErrors, validations){
    res.render("new-user", {
      styles: [],
      headScripts: [],
      title: "Nouvel utilisateur",
      pageHeader: {
        title: "Création d'un nouveau compte",
        strapline: "Complétez le formulaire suivant pour créer un nouveau compte"
      },
      userTriedInfo: req.body,
      confirmedGroupNames: confirmedGroupNames,
      userGroups: userGroups,
      formErrors: formErrors,
      mongooseErrors: mongooseErrors,
      validations: validations, 
      uzRole: req.user.role
    });
  }

  /*************** Function called by get route ***************/
  module.exports.displayNewUser= async function displayNewUser (req,res) {
    // req res useful ? 
    try { 
        var errors = [];
        var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
        var userGroups = await userGroup.getAllUserGroups();
        if (req.user.role === 'superadmin') {
          confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
          userGroups = userGroups.map(e=>e.toJSON());
          renderNewUser(req,res,confirmedGroupNames,userGroups,[],[],[]);
        }
        else {
          // obligatoirement admin (protégé niveau routes)
          // permettre seulement la création de comptes avec accès et aministration pour le groupe dont je suis déjà admin 
          let adminConfirmedGroupNames = await user.keepOnlyAdminGroups(req.user.email,confirmedGroupNames); 
          adminConfirmedGroupNames = adminConfirmedGroupNames.map(e=> e.toJSON());
          renderNewUser(req,res,adminConfirmedGroupNames,[],[],[],[]);
        }
       
    }
    catch (err) {
      //logger.log(err); 
      errors.push("Une erreur interne est survenue, veuillez réessayer"); 
      if (req.user.role === 'superadmin') {
        renderNewUser(req,res,confirmedGroupNames,userGroups,[],errors,[]);
      }
      else {
        renderNewUser(req,res,adminConfirmedGroupNames,[],[],[],[])
      }
    }
  }; 
  
/*************** Function called by post route ***************/
module.exports.newUserFormHandler = [
  body('userMail').trim().escape(),
  body('userName').trim().escape(),
  
  async function newUserFormHandler (req,res) {
    try {
      var uz = new Object();
      var formErrors = [];
      var mongooseErrors = [];
      var validations = [];
      formErrors = validator.validationResult(req);

      /* don't requery that and send errors differently ? */ 
      var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
      if (req.user.role === 'superadmin') {
        var userGroups = await userGroup.getAllUserGroups();
        confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
        userGroups = userGroups.map(e=>e.toJSON()); 
      }
      else {
        var adminConfirmedGroupNames = await user.keepOnlyAdminGroups(req.user.email,confirmedGroupNames); 
        adminConfirmedGroupNames = adminConfirmedGroupNames.map(e=> e.toJSON());
      }
  
      if (!formErrors.isEmpty()) {
        if (req.user.role === 'superadmin') {
          renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
        }
        else {
          // obligatoirement admin (protégé niveau routes)
          // permettre seulement la création de comptes avec accès et aministration pour le groupe dont je suis déjà admin 
          renderNewUser(req,res,adminConfirmedGroupNames,[],formErrors.errors,mongooseErrors,validations);
        }
      }
      else { 
        // required fields
        uz.username = req.body.userName; 
        uz.email = req.body.userMail; 
        uz.role = req.body.userRole; 
        // USER GROUPS
        if (req.body.userGroup) {
          uz.group = req.body.userGroup;
        }
        //DIFFERENT ROLES 
        if (uz.role === "user") {
          uz.accessTo = req.body.userGroupAccess;
        }
        else if (uz.role === "admin") {
          uz.accessTo = req.body.adminGroupAccess;
          uz.isAdmin = req.body.adminGroupAdmin;
        }
        else if (uz.role === "superadmin") {
          
        }
        else {
          // normalement impossible 
          formErrors.errors.push({"msg":"Something happened selecting role, please retry, if persistent contact a superadmin"}); 
          if (req.user.role === 'superadmin') {
            renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
          }
          else {
            // obligatoirement admin (protégé niveau routes)
            renderNewUser(req,res,adminConfirmedGroupNames,[],formErrors.errors,mongooseErrors,validations);
          } 
        }

        // create unique token and store expiration time for this email 
        let tokenString = await token.createToken(uz.email); 
      
         // add object user to user model
        await user.addUserObject(uz) ; 
        // send email to new user 
        await mailer.sendNewAccountMail(uz.email,tokenString);

        validations.push("Utilisateur crée avec succès, un e-mail permettant de terminer la configuration a été envoyé"); 
        if (req.user.role === 'superadmin') {
          renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
        }
        else {
          // obligatoirement admin (protégé niveau routes)
          renderNewUser(req,res,adminConfirmedGroupNames,[],formErrors.errors,mongooseErrors,validations);
        }
      }
    }
    catch(err) {
      //console.log(err); 
      mongooseErrors.push(err); 
      // MAYBE TODO : JUSTE GENERAL MESSAGE  (si mongoose save est l'erreur bien fait sinon général)
      // // not working si doublon username/email car déjà handle côté model user et généère une mongoose erreur marche pas non plus
      // if (err instanceof mongoose.Error.ValidationError) {
      //   mongooseErrors.push(err);
      // }
      // else {
      //   console.log(err instanceof mongoose.Error)   // false alors que devrait être true https://mongoosejs.com/docs/api/error.html
      //   mongooseErrors.push(new Error("Une erreur est survenue, veuillez réessayer"))
      // }
      
      // log morgan ?
      if (req.user.role === 'superadmin') {
        renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations); 
      }
      else {
        // obligatoirement admin (protégé niveau routes)
        renderNewUser(req,res,adminConfirmedGroupNames,[],formErrors.errors,mongooseErrors,validations); 
      }
      
    }
   }
];
