  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const {sensorGroup} = require('../../models/sensorGroup'); 
const {user} = require('../../models/user');

/*************** Render & datas ***************/
var renderAdmin = function (req,res,unconfirmedList,confirmedList){
  res.render("gestion-capteurs", {
    title: 'Gestion capteurs',
    pageHeader: {
      title:'Gestion des capteurs',
      strapline: "Accès au paramétrage des différents groupe de capteurs et chacun de leurs capteurs"
    },
    sensorGroupsUnconfirmed: unconfirmedList,
    sensorGroupsConfirmed: confirmedList,
  });
};
/*************** Function called by routes ***************/
/*GET 'ALL SENSORS GROUPS AVAILABLE FOR INDEX PAGE */
module.exports.renderAdminWithDatas = async function renderAdminWithDatas (req,res) {
  // req res useful ? 
  try { 
    let unconfirmedGroupsList = await sensorGroup.getAllUnconfirmedSensorGroups(); 
    let confirmedGroupsList = await sensorGroup.getAllConfirmedSensorGroups(); 
    
    
      if (req.user.role === 'superadmin') {
        //Fixing Handlebars issue: Access has been denied to resolve the property "uniqueid" because it is not an "own property" of its parent.
    // https://github.com/handlebars-lang/handlebars.js/issues/1642 
        unconfirmedGroupsList = unconfirmedGroupsList.map(e => e.toJSON());
        confirmedGroupsList = confirmedGroupsList.map(e => e.toJSON());
        renderAdmin(req,res,unconfirmedGroupsList,confirmedGroupsList);
      }
      else {
        // forcément admin car route déjà protégé 
        // afficher seulement les capteurs pour lesquels l'utilisateur connecté est administrateur
        let unconfirmedGroupsAdmin = await user.keepOnlyAdminGroups(req.user.email,unconfirmedGroupsList); 
        let confirmedGroupsAdmin = await user.keepOnlyAdminGroups(req.user.email,confirmedGroupsList); 
        unconfirmedGroupsAdmin = unconfirmedGroupsAdmin.map(e => e.toJSON());
        confirmedGroupsAdmin = confirmedGroupsAdmin.map(e => e.toJSON());
        renderAdmin(req,res,unconfirmedGroupsAdmin,confirmedGroupsAdmin);
      }
    }
  catch (err) {
    throw err; 
    // handle error ? 
  }
};