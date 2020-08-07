const {userGroup} = require ('../../models/userGroup');
const {sensorGroup} = require('../../models/sensorGroup');
const validator = require('express-validator');
const { body } = require('express-validator');
/*************** Render & datas ***************/
var renderNewUserGroup = function (req,res,confirmedGroupNames,formErrors, mongooseErrors, validations){
    res.render("new-user-group", {
      styles: [],
      headScripts: [],
      title: "Nouveau groupe d'utilisateurs",
      pageHeader: {
        title: "Création d'un nouveau groupe d'utilisateurs",
        strapline: "Complétez le formulaire suivant pour créer un nouveau groupe d'utilisateur"
      },
      confirmedGroupNames: confirmedGroupNames,
      //errors 
      formErrors: formErrors,
      mongooseErrors: mongooseErrors,
      validations: validations, 
    });
  }

/*************** Function called by get route ***************/
module.exports.displayNewUserGroup= async function displayNewUserGroup (req,res) {
    try { 
        var errors = [];
        var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ; 
       
        confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
        renderNewUserGroup(req,res,confirmedGroupNames,[],errors,[]); 
    } 
    catch (err) {
        errors.push(err); 
        renderNewUserGroup(req,res,confirmedGroupNames,[],errors,validations); 
    }
}

/*************** Function called by post route ***************/
module.exports.newUserGroupFormHandler = [
    body('groupName').trim().escape(),
    
    async function newUserGroupFormHandler (req,res) {
        try {
            var formErrors = [] ; 
            var mongooseErrors = [] ; 
            var validations = [] ; 

            var confirmedGroupNames = await sensorGroup.getAllConfirmedSensorGroupsNamesIds() ;
            confirmedGroupNames = confirmedGroupNames.map(e=>e.toJSON());
            formErrors = validator.validationResult(req);
            if (!formErrors.isEmpty()) {
                renderNewUserGroup(req,res,confirmedGroupNames,formErrors.errors,mongooseErrors,validations);
            }
            else { 
                await userGroup.addNewGroup(req.body) ; 
                validations.push("Groupe d'utilisateurs crée avec succès"); 
                renderNewUserGroup(req,res,confirmedGroupNames,[],[],validations);
            }
        }
        catch(err) {
            mongooseErrors.push(err); 
            renderNewUserGroup(req,res,confirmedGroupNames,[],mongooseErrors,[]);
        }
    }
];