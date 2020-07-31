  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const validator = require('express-validator');
const { check, body } = require('express-validator');
const {sensorGroup} = require('../../models/sensorGroup') 
const mongoose = require( 'mongoose');  
const {user} = require('../../models/user');
const {userGroup} = require('../../models/userGroup');

/*************** Render & datas ***************/
var renderSetup = function (req,res,group,users,admins,userGroups,formErrorArray,mongooseErrorArray,validationsMessageArray){
  res.render("setup", {
    title: 'Group setup',
    pageHeader: {
      title:"Paramétrage d'un groupe de capteurs et de ses capteurs",
      strapline: "Remplissez les informations dans les formulaires ci-après pour celles que vous souhaitez modifier/ajouter/confirmer" //todo
    },
    //get all sensors groups  , return all fields to index
    //change names 
    // todo return au niveau de la request du model ou a une autre étape que ce qui nous intéresse
    sensorGroup: group,
    users: users,
    admins: admins,
    userGroups : userGroups,
    formErrors: formErrorArray,
    mongooseErrors: mongooseErrorArray,
    validations: validationsMessageArray,
    role: req.user.role
  });
}
/*************** Function called by GET route ***************/
/*DISPLAY FORM FOR THE SENSOR GROUP WE WANT TO CONFIRM AND SETTING UP */
module.exports.renderSetupWithDatas = async function renderSetupWithDatas (req,res) {
  // req res useful ? 
  try { 
    var mongooseErrors = []; 
    var validations = [] ; 
    var formErrors = [];
    var group;
      // todo : errr 
    if (req.params.groupId) {
        group= await sensorGroup.getSensorGroupById(req.params.groupId); 
        var users = await user.getAllUsers () ;
        var admins = await user.getAllAdmins(); 
        var userGroups = await userGroup.getAllUserGroupsFields() ; 
        group = group.toJSON(); 
    }
    else {
        throw new Error('id parameter empty')
    }
    renderSetup(req,res,group,users,admins,userGroups,formErrors,mongooseErrors,validations);
  }
  catch (err) {
    mongooseErrors.push(err);
    renderSetup(req,res,group,users,admins,userGroups,formErrors,mongooseErrors,validations);
  }
};

/*************** Function called by POST route ***************/
/* HANDLE POST FORM SUBMISSION FOR SENSOR GROUP SETUP*/
module.exports.renderPostSetup = 
  [
  //middleware functions (express-validator)
  // body : same as check but only checking req.body (check aussi req.cookies, req.headers, req.params, req.pquery)
  //check('inputTest','ce champ est requis').trim().isLength({min:1}),
  body('groupName','Erreur au niveau du nom du groupe de capteurs').trim().escape(),
  body('groupTz','Veuillez fournir le fuseau horaire').not().isEmpty().trim(),
 // todo réu escape tz ???  
  async function renderPostSetup (req,res) {
  // req res useful ? 
  try { 
    var group;
    var mongooseErrors = [];
    var validations = [];
    var formErrors = [];  
    var groupId = req.params.groupId; 
    var formObject = req.body;
    // console.log(req.body.groupName);
    // console.log(req.body.groupTz);
    // console.log(req.body.groupAdmin);
    console.log(req.body);
    // console.log(req.body.groupUnconfirmed)
    // console.log(req.body.groupConfirmed)
    /// await check('inputTest','ce champ est requis').trim().isLength({min:1})
    // Finds the validation errors in this request and wraps them in an object with handy functions
    formErrors = validator.validationResult(req); 
    if (req.params.groupId) {
        group= await sensorGroup.getSensorGroupById(groupId); 
        //group = group.map(e => e.toJSON());
    }
    else {
        throw new Error('id parameter empty')
    }

    if (!formErrors.isEmpty()) {
      group = group.toJSON();   
      renderSetup(req,res,group,formErrors.errors,mongooseErrors,validations);
      return;
    }
    else {
      //mettre à jour le sensor group 
      group.name = formObject.groupName; 
      group.timezone = formObject.groupTz;
      
      let storedUsersWithAccess = await user.getUsersWithAccess(groupId); 
      let storedAdmins = await user.getAdmins(groupId);
      let storedGroupAdmin = await userGroup.getGroupAdmin (groupId);
      let storedGroupAccess = await userGroup.getGroupAccess (groupId); 

      /*********** FIELD ACCES AU GROUPE (UTILISATEUR & ADMIN) */
      // Si changement pour les utilisateurs ayant accès : modifier
      // Chaque d'utilisation testé 
      if (!(JSON.stringify(formObject.userAccess) === JSON.stringify(storedUsersWithAccess))) {
        // user supprimé (apparait dans stored user mais pas dans form object)
        if (!formObject.userAccess) {
          await user.suppressAccessAllUsers(groupId)
        }
        // else if (storedUsersWithAccess.length===0) {
        //   for (var j=0; j<formObject.userAccess.length;j++) {
        //     console.log("la")
        //     await user.addAccess(formObject.userAccess[j],groupId); 
        //   }
        else {
          if ((typeof formObject.userAccess) === 'string') { 
            formObject.userAccess = decodeURI(formObject.userAccess)
          }
          else {
            formObject.userAccess = formObject.userAccess.map(e=>decodeURI(e)); 
          }

          for (var i=0; i<storedUsersWithAccess.length;i++) {
            if (typeof formObject.userAccess === 'string') {
              if (!(formObject.userAccess === storedUsersWithAccess[i])) {
                await user.suppressAccess(storedUsersWithAccess[i],groupId)
              }
            }
            else {
              let index = formObject.userAccess.indexOf(storedUsersWithAccess[i]); 
              if (index === -1) {
                await user.suppressAccess(storedUsersWithAccess[i],groupId);
              } 
            }
          }
          // user ajouté (apparait dans form object mais pas dans storedUser)
          if (typeof formObject.userAccess === 'string') {
            let index = storedUsersWithAccess.indexOf(formObject.userAccess) ; 
            if (index === -1) {
              await user.addAccess(formObject.userAccess,groupId); 
            }
          }
          else {
            for (var j=0; j<formObject.userAccess.length;j++) {
              let index = storedUsersWithAccess.indexOf(formObject.userAccess[j]) ; 
              if (index === -1) {
                await user.addAccess(formObject.userAccess[j],groupId); 
              }
            }
          }
        }
      }

        /*********** FIELD ADMINISTRATION DU GROUPE (pour role ADMIN) */
      // Si changement pour les administrateurs du group : modifier
      if (!(JSON.stringify(formObject.userAdmin) === JSON.stringify(storedAdmins))) {
        // user supprimé (apparait dans stored user mais pas dans form object)
        if (!formObject.userAdmin) {
          await user.suppressAdminAllAdmin(groupId)
        }
        else {
          if ((typeof formObject.userAdmin) === 'string') { 
            formObject.userAdmin = decodeURI(formObject.userAdmin)
          }
          else {
            formObject.userAdmin = formObject.userAdmin.map(e=>decodeURI(e)); 
          }


          for (var i=0; i<storedAdmins.length;i++) {
            if (typeof formObject.userAdmin === 'string') {
              if (!(formObject.userAdmin === storedAdmins[i])) {
                await user.suppressAdmin(storedAdmins[i],groupId);
              } 
            }
            else {
              let index = formObject.userAdmin.indexOf(storedAdmins[i]); 
              if (index === -1) {
                await user.suppressAdmin(storedAdmins[i],groupId);
              } 
            } 
          }
          // user ajouté (apparait dans form object mais pas dans storedUser)
          if (typeof formObject.userAdmin === 'string') {
            // user ajouté
            let index = storedAdmins.indexOf(formObject.userAdmin) ; 
            if (index === -1) {
              await user.addAdmin(formObject.userAdmin,groupId); 
            }

          }
          else {
            for (var j=0; j<formObject.userAdmin.length;j++) {
              let index = storedAdmins.indexOf(formObject.userAdmin[j]) ; 
              if (index === -1) {
                await user.addAdmin(formObject.userAdmin[j],groupId); 
              }
            }
          }

        }
      }

        /*********** FIELD ADMINISTRATION DU GROUPE (pour ADMIN niveau groupes d'utilisateurs)  */
      // Si changement pour les groupes d'utilisateurs administrateurs du sensorgroup : modifier
      if (!(JSON.stringify(formObject.userGroupAdmin) === JSON.stringify(storedGroupAdmin))) {
        // user supprimé (apparait dans stored user mais pas dans form object)
        if (!formObject.userGroupAdmin) {
          await userGroup.suppressAdminAllGroups(groupId)
        }
        else {
          if ((typeof formObject.userGroupAdmin) === 'string') { 
            formObject.userGroupAdmin = decodeURI(formObject.userGroupAdmin)
          }
          else {
            formObject.userGroupAdmin = formObject.userGroupAdmin.map(e=>decodeURI(e)); 
          }

          for (var i=0; i<storedGroupAdmin.length;i++) {
            if (typeof formObject.userGroupAdmin === 'string') {
              if (!(formObject.userGroupAdmin === storedGroupAdmin[i])) {
                await userGroup.suppressAdminFromGroup(storedGroupAdmin[i],groupId);
              } 
            }
            else {
              let index = formObject.userGroupAdmin.indexOf(storedGroupAdmin[i]); 
              if (index === -1) {
                await userGroup.suppressAdminFromGroup(storedGroupAdmin[i],groupId);
              } 
            } 
          }
          // user ajouté (apparait dans form object mais pas dans storedUser)
          if (typeof formObject.userGroupAdmin === 'string') {
            // user ajouté
            let index = storedGroupAdmin.indexOf(formObject.userGroupAdmin) ; 
            if (index === -1) {
              await userGroup.addAdminToGroup(formObject.userGroupAdmin,groupId); 
            }
          }
          else {
            for (var j=0; j<formObject.userGroupAdmin.length;j++) {
              let index = storedGroupAdmin.indexOf(formObject.userGroupAdmin[j]) ; 
              if (index === -1) {
                await userGroup.addAdminToGroup(formObject.userGroupAdmin[j],groupId); 
              }
            }
          }
        }
      }

         /*********** FIELD ACCES AU GROUPE (niveau groupes d'utilisateurs)  */
      // Si changement pour les accès des groupes d'utilisateurs pour le sensorgroup : modifier
      if (!(JSON.stringify(formObject.userGroupAccess) === JSON.stringify(storedGroupAccess))) {
        // user supprimé (apparait dans stored user mais pas dans form object)
        if (!formObject.userGroupAccess) {
          await userGroup.suppressAccessAllGroups(groupId)
        }
        else {
          if ((typeof formObject.userGroupAccess) === 'string') { 
            formObject.userGroupAccess = decodeURI(formObject.userGroupAccess)
          }
          else {
            formObject.userGroupAccess = formObject.userGroupAccess.map(e=>decodeURI(e)); 
          }

          for (var i=0; i<storedGroupAccess.length;i++) {
            if (typeof formObject.userGroupAccess === 'string') {
              if (!(formObject.userGroupAccess === storedGroupAccess[i])) {
                await userGroup.suppressAccessFromGroup(storedGroupAccess[i],groupId);
              } 
            }
            else {
              let index = formObject.userGroupAccess.indexOf(storedGroupAccess[i]); 
              if (index === -1) {
                await userGroup.suppressAccessFromGroup(storedGroupAccess[i],groupId);
              } 
            } 
          }
          // user ajouté (apparait dans form object mais pas dans storedUser)
          if (typeof formObject.userGroupAccess === 'string') {
            // user ajouté
            let index = storedGroupAccess.indexOf(formObject.userGroupAccess) ; 
            if (index === -1) {
              await userGroup.addAccessToGroup(formObject.userGroupAccess,groupId); 
            }
          }
          else {
            for (var j=0; j<formObject.userGroupAccess.length;j++) {
              let index = storedGroupAccess.indexOf(formObject.userGroupAccess[j]) ; 
              if (index === -1) {
                await userGroup.addAccessToGroup(formObject.userGroupAccess[j],groupId); 
              }
            }
          }
        }
      }
    
     /**** CONFIRMED ?  */
      if(req.body.groupConfirmed === "confirmed" ) {
        group.confirmed = true; 
      } else {
        group.confirmed = false;
      }
      // todo appeler une méthode du model? 
      await group.save(); 
      // send validation message ?? 
      validations.push("Le groupe de capteurs a été modifié avec succès");
      group = group.toJSON();
      var users = await user.getAllUsers () ;
      var admins = await user.getAllAdmins(); 
      var userGroups = await userGroup.getAllUserGroupsFields() ;  
      renderSetup(req,res,group,users,admins,userGroups,formErrors.errors,mongooseErrors,validations);
    }
  }
  catch (err) {
    // render avec une erreur survenue aussi ?
    console.log(err);  
    group = group.toJSON(); 
    mongooseErrors.push(err); 
    renderSetup(req,res,group,users,admins,userGroups,formErrors.errors,mongooseErrors)
    //throw err; 
    //err ? 
  }
}];

module.exports.renderPostSensor = 
[ //middleware functions (express-validator)
  // todo vérifier que c'est correct d'utiliser le escape la ? 
  // todo réu 
  // désecape quand on le récupère de la base 
  body('sensName').trim().escape(),
  body('sensType').trim().escape(),
  body('sensUnit').trim().escape(),
  body('sensVmax').trim().escape(),
  body('sensVmin').trim().escape(), 
  body('sensPrec').trim().escape(),

  async function renderPostSensor (req,res) {
    // req res useful ? 
  try { 
    var group; 
    var formErrors = [] ; 
    var mongooseErrors = [] ;
    var validations = []; 
    console.log(req.params.groupId);
    console.log(req.params.sensorId);
    formErrors = validator.validationResult(req); 
    if (req.params.groupId) {
      group= await sensorGroup.getSensorGroupById(req.params.groupId); 
      //group = group.map(e => e.toJSON());
    }
    else {
      throw new Error('id parameter empty')
    }

    if (!formErrors.isEmpty()) {
      group = group.toJSON();   
      renderSetup(req,res,group,formErrors.errors,mongooseErrors,validations);
      return;
    }
    else {
      var i ; 
      // register modificated sensor 
      for (i=0;i<group.sensors.length;i++) {
        if (group.sensors[i].sensorId === req.params.sensorId) {
         // confirmation 
          if (req.body.sensConfirmation === "confirmed") {
            group.sensors[i].confirmed = true; 
          }
          else {
            group.sensors[i].confirmed = false; 
          }
          // name 
          group.sensors[i].metric = req.body.sensMetric; 
          group.sensors[i].name = req.body.sensName ;
          // type // todo add regexp or something? 
          group.sensors[i].data.type = req.body.sensType; 
          // unité 
          group.sensors[i].data.unit = req.body.sensUnit;
          // others - optionel; pas de test, on stock null si la valeur n'est pas renseignée
          group.sensors[i].data.max = req.body.sensVmax ; 
          group.sensors[i].data.min = req.body.sensVmin ; 
          group.sensors[i].data.precision = req.body.sensPrec ; 
          
        }
      }
     await group.save();
     group = group.toJSON();
     validations.push("Les informations du capteur '"+req.params.sensorId+"' du groupe '"+req.params.groupId+"' ont été modifiées avec succès")
     renderSetup(req,res,group,formErrors.errors,mongooseErrors,validations)
    }
  }
  catch (err) {
    group = group.toJSON(); 
    mongooseErrors.push(err); 
    renderSetup(req,res,group,formErrors.errors,mongooseErrors,validations)
  }
}]; 

