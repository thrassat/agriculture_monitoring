'use strict';
// todo improve : découpler avec le modele ... 

const {user} = require('../../models/user');
const {userGroup} = require ('../../models/userGroup');
const {sensorGroup} = require('../../models/sensorGroup')
// const jsHelper = require('../helpers/jsHelpers');
// const { render } = require('node-sass');
// const storedDatas = require('../../models/storedDatas');
//const { validator } = require('express-validator');
//  const { mongo } = require('mongoose');
/*************** Render & datas ***************/
var renderParamCompt = function (req,res,userObject,userGroups,sensorGroups,formErrors,mongooseErrors,validations){
  res.render("param-compte", {
    title: "Paramétrage compte",
    pageHeader: {
      title:"Paramétrage d'un compte utilisateur",
      strapline: "Vous pouvez modifier ici rôles & accès de l'utilisateur"
    },
    uz: userObject,
    userGroups: userGroups,
    confirmedGroupNames: sensorGroups,
    // errors & validation
    formErrors: formErrors,
    mongooseErrors: mongooseErrors, 
    validations: validations
  });
}
/*************** Function called by get routes ***************/
module.exports.displayParamCompt= async function displayParamCompt (req,res) {
  // req res useful ? 
  try { 
  //  var formErrors = [];
    var mongooseErrors = [];
   // var validations = [];
    let userObject = await user.getUserByUsername(req.params.username); 
    let userGroups = await userGroup.getAllUserGroups();
    
    let confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
    confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
    userObject = userObject.toJSON();
    userGroups = userGroups.map(e => e.toJSON());
    //error
    renderParamCompt(req,res,userObject,userGroups,confirmedGroupNames,[],[],[]);
  }
  catch (err) {
    mongooseErrors.push(err); 
    renderParamCompt(req,res,userObject,userGroups,confirmedGroupNames,[],mongooseErrors,[]);
  }
};

// todo : suppression de comptes 

/*************** Function called by post routes ***************/
module.exports.postUserParam = [

  async function postUserParam (req,res) {

    try {
      var formErrors = [];
      var mongooseErrors = [];
      var validations = [];
      //formErrors = validator.validationResult(req);
      var formObject = req.body ; 
      // récupérer l'utilisateur 
      var storedUser = await user.getUserByUsername(req.params.username)
      var userGroups = await userGroup.getAllUserGroups();
      var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
     
      // console.log("-------")
      // console.log(storedUser) 
      // console.log("-------")
      // console.log(typeof storedUser.accessTo)
      // console.log(typeof formObject.userGroupAccess)

      // console.log(storedUser.accessTo==formObject.userGroupAccess)
      // console.log(storedUser.accessTo===formObject.userGroupAccess)
      // console.log(JSON.stringify(storedUser.accessTo)===JSON.stringify(formObject.userGroupAccess))
      
      // /***** User groups Modification *****/  
      // console.log(!(JSON.stringify(formObject.userGroup) === JSON.stringify(storedUser.group)))

      // console.log("ug from form")
      // console.log(formObject.userGroup)
      // console.log(typeof formObject.userGroup)
  
      // console.log("ug in db")
      // console.log(storedUser.group)
      // console.log(typeof storedUser.group)
      // console.log(typeof storedUser.group[0])

      //potential todo generic function
      if (typeof formObject.userGroup === 'string') {
        var sto = formObject.userGroup;
        formObject.userGroup = [];
        formObject.userGroup.push(sto);
      }
      if (typeof formObject.userGroupAccess === 'string') {
        var sto = formObject.userGroupAccess; 
        formObject.userGroupAccess = [];
        formObject.userGroupAccess.push(sto); 
      }
      if (typeof formObject.adminGroupAdmin === 'string') {
        var sto = formObject.adminGroupAdmin; 
        formObject.adminGroupAdmin = [] ; 
        formObject.adminGroupAdmin.push(sto); 
      }
      if (typeof formObject.adminGroupAccess === 'string') {
        var sto = formObject.adminGroupAccess; 
        formObject.adminGroupAccess = []; 
        formObject.adminGroupAccess.push(sto); 
      }


      if (!(JSON.stringify(formObject.userGroup) === JSON.stringify(storedUser.group))) {
        // si on a modifier la liste de groupe d'utilisateur auquel(s) appartient l'utilisateur
        //todo test si ya une valeur, un array ... différents cas   
        if (!((formObject.userGroup === undefined) && (storedUser.group.length ===0))) {
          storedUser.group = formObject.userGroup.map(e=>decodeURI(e)); 
          await storedUser.save();
          validations.push("Certaines appartenances à des groupes d'utilisateurs ont été modifiées avec succès")
          
        }
      }

      /******* ROLE, ACCESS & ADMIN MODIFICATION *****/ 
      if (storedUser.role === formObject.userRole) {
        // rôle du compte non modifié 
        if (storedUser.role === 'user') {
          //user
          if (JSON.stringify(storedUser.accessTo)===JSON.stringify(formObject.userGroupAccess) || ((formObject.userGroupAccess === undefined) && (storedUser.accessTo.length === 0))) {
            // pas de modification (2eme condition la pour le cas ou l'array stocké et l'array du form sont tout deux vides )
            // message de validation eet render ? 
            confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
            storedUser = storedUser.toJSON();
            userGroups = userGroups.map(e => e.toJSON());
            validations.push("Pas de modification de rôle & d'accès")
            renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations);
          }
          else { 
            //modification des accès 
            storedUser.accessTo = formObject.userGroupAccess;
            await storedUser.save()
            confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
            storedUser = storedUser.toJSON();
            userGroups = userGroups.map(e => e.toJSON());
            // validations et render
            validations.push("Certains accès à des groupes de capteurs ont été modifiés avec succès")
            renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
          }
        }
        else if (storedUser.role ==='admin') {
          //admin(rôle inchangé)
          // checker les accès 
          //adminGroupAccess 
          if ((JSON.stringify(storedUser.accessTo)===JSON.stringify(formObject.adminGroupAccess)) || ((formObject.adminGroupAccess === undefined) && (storedUser.accessTo.length === 0)) ){
            if ((JSON.stringify(storedUser.isAdmin)===JSON.stringify(formObject.adminGroupAdmin)) || ((formObject.adminGroupAdmin === undefined) && (storedUser.isAdmin.length === 0))) {
              // rien n'a été modifié 
              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              validations.push("Pas de modification d'accès ou d'administration")
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations);
            }
            else {
              // juste admin modifiés 
              storedUser.isAdmin = formObject.adminGroupAdmin;
              await storedUser.save()
              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              // validations et render
              validations.push("Certains statuts administrateurs pour des groupes de capteurs ont été modifiés avec succès")
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
            }
          }
          else {
            // acces modifié
            if ((JSON.stringify(storedUser.isAdmin)===JSON.stringify(formObject.adminGroupAdmin)) || ((formObject.adminGroupAdmin === undefined) && (storedUser.isAdmin.length === 0))) {
              // pas de mofification admin (juste accès) 
              storedUser.accessTo = formObject.adminGroupAccess;
              await storedUser.save();

              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              validations.push("Certains accès à des groupes de capteurs ont été modifiés avec succès")
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations);
            }
            else {
              // admin modifié aussi (accès et admin changés)
              storedUser.accessTo = formObject.adminGroupAccess;
              storedUser.isAdmin = formObject.adminGroupAdmin;
              await storedUser.save()

              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              // validations et render
              validations.push("Certains accès et statuts administrateur pour des groupes de capteurs ont été modifiés avec succès")
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
            }
          }
        }
        else {
          //superadmin
          // rien faire car était déjà superadmin
          validations.push("Rôle superadministrateur non modifié"); 
          await storedUser.save();
          confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
          storedUser = storedUser.toJSON();
          userGroups = userGroups.map(e => e.toJSON());
          renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations);
        }
      }
      else {
        // le role de l'utilisateur a changé 
        if (storedUser.role === 'user') {
          //était user devient admin ou superadmin 
          if (formObject.userRole === 'admin') {
            storedUser.role = formObject.userRole ; 
            if (JSON.stringify(storedUser.accessTo)===JSON.stringify(formObject.adminGroupAccess)) {
              // meme accès 
              storedUser.isAdmin = formObject.adminGroupAdmin; 
              await storedUser.save(); 

              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              // validations et render
              validations.push("Rôle de l'utilisateur modifié avec succès, il est maintenant administrateur des groupes de capteurs soumis"); 
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
            }
            else { 
              //accès modifiés 
              storedUser.accessTo = formObject.adminGroupAccess; 
              storedUser.isAdmin = formObject.adminGroupAdmin; 
              await storedUser.save(); 

              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              // validations et render
              validations.push("Rôle de l'utilisateur modifié avec succès, il est maintenant administrateur des groupes de capteurs soumis, et certains accès ont été modifiés"); 
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
            }

          }
          else if (formObject.userRole === 'superadmin') {
            storedUser.accessTo = []; 
            storedUser.role = formObject.userRole; 
            await storedUser.save(); 

            confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
            storedUser = storedUser.toJSON();
            userGroups = userGroups.map(e => e.toJSON());
            // validations et render
            validations.push("Rôle de l'utilisateur modifié avec succès, il est maintenant superadministrateur (accès et administration de tout groupe)"); 
            renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 

          }
          else {
            // ne devrait pas pouvoir passer ici 
            throw new Error("Erreur interne, veuillez soumettre à nouveau vos modifications")
          }
        }
        else if (storedUser.role ==='admin') {
          //admin(rôle modifié)
          // avant était admin : devient user ou superadmin
          // devient superadmin
          if (formObject.userRole === 'superadmin') {
            storedUser.accessTo = []; 
            storedUser.isAdmin = []; 
            storedUser.role = formObject.userRole; 
            await storedUser.save(); 

            confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
            storedUser = storedUser.toJSON();
            userGroups = userGroups.map(e => e.toJSON());
            // validations et render
            validations.push("Rôle de l'utilisateur modifié avec succès, il est maintenant superadministrateur (accès et administration de tout groupe)"); 
            renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
          } 
          // d'admin devient user
          else if (formObject.userRole === 'user') {
            storedUser.isAdmin = []; 
            storedUser.role = formObject.userRole; 
            if ((JSON.stringify(storedUser.accessTo)===JSON.stringify(formObject.userGroupAccess))|| ((formObject.userGroupAccess === undefined) && (storedUser.accessTo.length === 0))) {
              //pas de modification des accès
              storedUser.role = formObject.userRole; 
              await storedUser.save()

              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              // validations et render
              validations.push("Rôle de l'utilisateur modifié avec succès")
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
            } 
            else {
              // modification des accès 
              storedUser.accessTo = formObject.userGroupAccess; 
              await storedUser.save(); 
              
              confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
              storedUser = storedUser.toJSON();
              userGroups = userGroups.map(e => e.toJSON());
              // validations et render
              validations.push("Rôle de l'utilisateur et certains accès modifiés avec succès")
              renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
            }
          }
          else {
            // ne devrait pas pouvoir passer ici (cas : devient ni user ni superadmin en ayant été admin)
            throw new Error("Erreur interne, veuillez soumettre à nouveau vos modifications")
          }
        }
        else if (storedUser.role === 'superadmin') {
          // était superadmin devient admin ou user 
          if (formObject.userRole === 'user') {
            // devient utilisateur 
            storedUser.role = formObject.userRole; 
            storedUser.accessTo = formObject.userGroupAccess; 
            await storedUser.save(); 

            confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
            storedUser = storedUser.toJSON();
            userGroups = userGroups.map(e => e.toJSON());
            // validations et render
            validations.push("Le rôle de l'utilisateur (de superadmin à utilisateur) et ses accès ont été modifiés avec succès")
            renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
          }
          else if (formObject.userRole === 'admin') {
             // devient administrateur 
             storedUser.role = formObject.userRole; 
             storedUser.accessTo = formObject.adminGroupAccess; 
             storedUser.isAdmin = formObject.adminGroupAdmin; 
             await storedUser.save(); 
 
             confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
             storedUser = storedUser.toJSON();
             userGroups = userGroups.map(e => e.toJSON());
             // validations et render
             validations.push("Le rôle de l'utilisateur (de superadmin à admin); ses accès et administrations ont été modifiés avec succès");
             renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
          } 
          else {
            // normalement impossible 
            throw new Error("Erreur interne, veuillez soumettre à nouveau vos modifications")
          }
        }

        else {
          /// ne devrait pas pouvoir entrer là (role de l'utilisateur déjà en base ni admin, ni user, ni superadmin)
          throw new Error("Erreur interne, veuillez soumettre à nouveau vos modifications")
        }
        


          // if (JSON.stringify(storedUser.accessTo)===JSON.stringify(formObject.adminGroupAccess)) {
          //   if (JSON.stringify(storedUser.isAdmin)===JSON.stringify(formObject.adminGroupAdmin)) {
          //     // rien n'a été modifié 
          //     confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
          //     storedUser = storedUser.toJSON();
          //     userGroups = userGroups.map(e => e.toJSON());
          //     validations.push("Pas de modification d'accès ou d'administration")
          //     renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations);
          //   }
          //   else {
          //     // juste admin modifiés 
          //     storedUser.isAdmin = formObject.adminGroupAdmin;
          //     await storedUser.save()
          //     confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
          //     storedUser = storedUser.toJSON();
          //     userGroups = userGroups.map(e => e.toJSON());
          //     // validations et render
          //     validations.push("Certains statuts administrateur pour des groupes de capteurs ont été modifiés avec succès")
          //     renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
          //   }
          // }
          // else {
          //   // acces modifié
          //   if (JSON.stringify(storedUser.isAdmin)===JSON.stringify(formObject.adminGroupAdmin)) {
          //     // pas de mofification admin (juste accès) 
          //     storedUser.accessTo = formObject.adminGroupAccess;
          //     await storedUser.save();

          //     confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
          //     storedUser = storedUser.toJSON();
          //     userGroups = userGroups.map(e => e.toJSON());
          //     validations.push("Certains accès à des groupes de capteurs ont été modifiés avec succès")
          //     renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations);
          //   }
          //   else {
          //     // admin modifié aussi (accès et admin changés)
          //     storedUser.accessTo = formObject.adminGroupAccess;
          //     storedUser.isAdmin = formObject.adminGroupAdmin;
          //     await storedUser.save()

          //     confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
          //     storedUser = storedUser.toJSON();
          //     userGroups = userGroups.map(e => e.toJSON());
          //     // validations et render
          //     validations.push("Certains accès et statuts administrateur pour des groupes de capteurs ont été modifiés avec succès")
          //     renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],[],validations) ; 
          //   }
          // }
      // ET LE GROUP ACCESS 


      // if (storedUser.accessTo === formObject.userGroupAccess) {
      //   console.log("user accessTo egaux")
      // }
      // if (storedUser.accessTo === formObject.adminGroupAccess) {
      //   console.log("stored user accessTo  - admin group access egaux")
      // }
      // if (storedUser.isAdmin === formObject.adminGroupAdmin ) {
      //   console.log("admin égaux ")
      // }
      // if selon le role (attention au role soumis et au role qu'il y avait avant!)
      }
    }

      // mettre à jour 
    catch (err) {
      console.log(err)
      mongooseErrors.push(err);
      confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
      storedUser = storedUser.toJSON();
      userGroups = userGroups.map(e => e.toJSON());
      renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],mongooseErrors,[]) ;
    }
  }
];

/******** POST CALL FOR DELETE ROUTE **************/
/// COMPTE UTILSATEUR
module.exports.deleteUserAccount =async function deleteUserAccount (req,res) {
  try {
    await user.deleteUserByEmail(req.params.email);
    res.redirect('/gestion-comptes');
  }
  catch(err) {
    //var formErrors = [];
    var mongooseErrors = []; 
    mongooseErrors.push(err);
    // récupérer l'utilisateur 
    var storedUser = await user.getUserByEmail(req.params.email)
    var userGroups = await userGroup.getAllUserGroups();
    var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
    confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
    storedUser = storedUser.toJSON();
    userGroups = userGroups.map(e => e.toJSON());
    renderParamCompt(req,res,storedUser,userGroups,confirmedGroupNames,[],mongooseErrors,[]) ;
  }
}