  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const {user} = require('../../models/user');
const {userGroup} = require ('../../models/userGroup');
/*************** Render & datas ***************/
var renderAdminGestCompt = function (req,res,users,userGroups){
  res.render("gestion-comptes", {
    title: 'Gestion comptes',
    pageHeader: {
      title:'Gestion des comptes',
      strapline: "Créez et modifiez ici comptes et groupes d'utilisateurs"
    },
    users : users,
    userGroups: userGroups,
    uzRole : req.user.role
  });
}

/*************** Function called by routes ***************/
module.exports.displayGestCompt= async function displayGestCompt (req,res) {
  // req res useful ? 
  try { 
    let users = await user.getAllUsersNameRole(); 
    let userGroups = await userGroup.getAllUserGroups();
    if (req.user.role === 'superadmin') {
      users = users.map(e => e.toJSON());
      userGroups = userGroups.map(e => e.toJSON());
      renderAdminGestCompt(req,res,users,userGroups);
    }
    else {
      // route protégé forcément un admin : 
      // Display seulement la possibilité de créer un compte pour les sensorgroup pour les sensorgrup liés
      renderAdminGestCompt(req,res,[],[]);
    }

  }
  catch (err) {
    throw err; 
  }
};

