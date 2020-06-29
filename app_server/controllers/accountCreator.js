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
      userTriedInfo: req.body,
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
      var uz = new Object();
      var formErrors = [];
      var mongooseErrors = [];
      var validations = [];
      formErrors = validator.validationResult(req);

      /* don't requery that and send errors differently ? */ 
      var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
      var userGroups = await userGroup.getAllUserGroups();
      confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
      userGroups = userGroups.map(e=>e.toJSON()); 
      if (!formErrors.isEmpty()) {
        renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
      }
      else { 
        // required fields
        uz.username = req.body.userName; 
        uz.email = req.body.userMail; 
        uz.role = req.body.userRole; 
        if (req.body.userGroup) {
          if (typeof req.body.userGroup === 'string') {
          //like this ? on verra au save
          uz.group = []
          uz.group.push(req.body.userGroup);
          } 
          else {
            uz.group = req.body.userGroup;
          }
        }
        if (uz.role === "user") {

        // how to handle checkboxes ? 
        // stocker les _id mongo ? ou les unique name arduino OUI ça (si effectivement ceux hardware c bon)
          uz.accessTo = req.body.userGroupAccess; 

        }
        else if (uz.role === "admin") {
          // si un seul choix pas dans un array ; todo
          console.log(typeof req.body.adminGroupAdmin)
          console.log(typeof req.body.adminGroupAccess)

          if (typeof req.body.adminGroupAccess === 'string') {
            // 1 seul sélectionné, n'est pas un array
            uz.accessTo= [];
            uz.accessTo.push(req.body.adminGroupAccess);
          }
          else {
            
            uz.accessTo = req.body.adminGroupAccess;
            console.log(typeof uz.accessTo)
           // console.log(uz.accessTo.toArray())
          }

          if (typeof req.body.adminGroupAdmin === 'string') {
            // 1 seul sélectionné, n'est pas un array
            uz.isAdmin= [];
            uz.isAdmin.push(req.body.adminGroupAdmin);
          }
          else {
            uz.isAdmin = req.body.adminGroupAdmin
          }
        
        }
        else if (uz.role === "superadmin") {
          // add accessTo / admin all ? 
        }
        else {
          // normalement impossible 
          formErrors.errors.push({"msg":"Something happened selecting role, please retry, if persistent contact a superadmin"}); 
          renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);
        }

        // call user schema method : addUser 
        // password ? 
        // faire un add user pour chaque role ? 
        
        user.serializeUser(uz); // something with this?
        await user.addUserObject(uz) ; 
        validations.push("Utilisateur crée avec succès");
        renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations);

      }
    }
    catch(err) {
      console.log(err); 
      mongooseErrors.push(err); 
      console.log(" RES OBJECT : ")
      console.log(res);
      console.log(" REQ OBJECT : ")
      console.log(req);
      renderNewUser(req,res,confirmedGroupNames,userGroups,formErrors.errors,mongooseErrors,validations); 
      // handlehowto ? send message to view : améliorer ça car la on a entièrement le message 
      // on a fait qcch de ce type pour le sensorgroup
      // avoir les valeurs déjà rentrées dans le formualire
      // todo

    }
   }
];
