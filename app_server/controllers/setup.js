  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const validator = require('express-validator');
const { check, body } = require('express-validator');
const {sensorGroup} = require('../../models/sensorGroup') 
const mongoose = require( 'mongoose');  

/*************** Render & datas ***************/
var renderSetup = function (req,res,group,formErrorArray,mongooseErrorArray,validationsMessageArray){
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
    formErrors: formErrorArray,
    mongooseErrors: mongooseErrorArray,
    validations: validationsMessageArray
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
        //group = group.map(e => e.toJSON());
        group = group.toJSON(); 
    }
    else {
        throw new Error('id parameter empty')
    }
    renderSetup(req,res,group,formErrors,mongooseErrors,validations);
  }
  catch (err) {
    mongooseErrors.push(err);
    renderSetup(req,res,group,formErrors,mongooseErrors,validations);
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
      //mettre à jour le sensor group 
      group.name = req.body.groupName; 
      group.timezone = req.body.groupTz;
      // todo group.owners
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
      renderSetup(req,res,group,formErrors.errors,mongooseErrors,validations);
    }
  }
  catch (err) {
    // render avec une erreur survenue aussi ?
    console.log(err);  
    group = group.toJSON(); 
    mongooseErrors.push(err); 
    renderSetup(req,res,group,formErrors.errors,mongooseErrors)
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

