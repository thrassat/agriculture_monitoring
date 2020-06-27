const {user} = require('../../models/user')  
const {sensorGroup} = require('../../models/sensorGroup')
const {userGroup} = require ('../../models/userGroup');
const validator = require('express-validator');
const { body } = require('express-validator');
/*************** Render & datas ***************/
var renderNewUser = function (req,res,confirmedGroupNames,userGroups,formErrors, mongooseErrors, validations){
    res.render("new-user", {
      styles: ['multiselect.css','vanillaSelectBox.css'],
      headScripts: ['multiselect.min.js'],
      title: "Nouvel utilisateur",
      pageHeader: {
        title: "Création d'un nouveau compte",
        strapline: "Complétez le formulaire suivant pour créer un nouveau compte"
      },
      confirmedGroupNames: confirmedGroupNames,
      userGroups: userGroups,
      formErrors: formErrors,
      mongooseErrors: mongooseErrors,
      validations: validations
    });
  }
  /*************** Function called by get route ***************/
  module.exports.displayNewUser= async function displayNewUser (req,res) {
    // req res useful ? 
    try { 
        let confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
        let userGroups = await userGroup.getAllUserGroups();
        confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
        userGroups = userGroups.map(e=>e.toJSON());
        renderNewUser(req,res,confirmedGroupNames,userGroups,[],[],[]);
    }
    catch (err) {
      throw err; 
    }
  }; 
  
/*************** Function called by post route ***************/
module.exports.newUserFormHandler = [
  body('userMail').trim().escape(),
  body('userName').trim().escape(),

  async function newUserFormHandler (req,res) {
    try {
      console.log(req.body);
      // probleme pour instancier l'user object 
      var user = new Object();
      var formErrors = [];
      var mongooseErrors = [];
      var validations = [];
      formErrors = validator.validationResult(req);

      /* don't requery that and send errors differently ? */ 
      let confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
      let userGroups = await userGroup.getAllUserGroups();
      confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
      userGroups = userGroups.map(e=>e.toJSON()); 
      if (!formErrors.isEmpty()) {
        renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
      }
      else { 
        // required fields
        user.username = req.body.userName; 
        user.email = req.body.userMail; 
        user.role = req.body.userRole; 
        if (req.body.userGroup) {
          //like this ? on verra au save
          user.group = req.body.userGroup;
        }
        if (user.role === "user") {

        // how to handle checkboxes ? 
        // stocker les _id mongo ? ou les unique name arduino OUI ça (si effectivement ceux hardware c bon)

        }
        else if (user.role === "admin") {
       
        }
        else if (user.role === "superadmin") {

        }
        else {
          // normalement impossible 
          formErrors.errors.push({"msg":"Something happened selecting role, please retry, if persistent contact a superadmin"}); 
          renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
        }

        // call user schema method : addUser 
        // password ? 
      }
    }
    catch(err) {
      throw err; 
      // handlehowto ? 
    }
   }
];
