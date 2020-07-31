'use strict';

const {userGroup} = require ('../../models/userGroup');
const {sensorGroup} = require('../../models/sensorGroup');
const { mongo } = require('mongoose');



var renderParamUserGroup = function (req,res,groupObject, sensorGroups,formErrors,mongooseErrors,validations) {
    res.render("param-usergroup", {
        title: "Paramétrage groupe d'utilisateurs",
        pageHeader: {
          title:"Paramétrage d'un groupe d'utilisateurs",
          strapline: "Vous pouvez modifier ici rôles & accès du groupe d'utilisateurs"
        },
        group: groupObject,
        confirmedGroupNames: sensorGroups,
        // errors & validation
        formErrors: formErrors,
        mongooseErrors: mongooseErrors, 
        validations: validations
    });
}

// todo modif le nom (faire le changer dans toutes les appartenances quand modification)
// ajouter les user à la création du group 

// todo suppression !!!!!

/*************** Function called by get routes ***************/
module.exports.displayParamUserGroup = async function displayParamUserGroup (req,res) {
    // req res useful ? 
    try {
        var mongooseErrors = [];
        var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
        confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
        let groupObject = await userGroup.getUserGroup(req.params.groupname); 
        groupObject = groupObject.toJSON();
        renderParamUserGroup(req,res,groupObject,confirmedGroupNames,[],[],[]);
    }
    catch(err) {
        mongooseErrors.push(err); 
        renderParamUserGroup(req,res,groupObject,confirmedGroupNames,[],mongooseErrors,[]);

    }
}


/*************** Function called by post routes ***************/
module.exports.postUserGroupParam = [

    async function postUserGroupParam (req,res) {
  
      try {
        var formErrors = [];
        var mongooseErrors = [];
        var validations = [];
        var groupObject = await userGroup.getUserGroup(req.params.groupname); 
        var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
        confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
        var newGroup = await userGroup.updateGroup (req.params.groupname,req.body) ; 
        validations.push("Action effectuée avec succès")
        renderParamUserGroup(req,res,newGroup.toJSON(),confirmedGroupNames,[],[],validations);
    }
      catch(err) {
        mongooseErrors.push(err) ;
        renderParamUserGroup(req,res,groupObject.toJSON(),confirmedGroupNames,[],mongooseErrors,[]);
      }
    }
];
