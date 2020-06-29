  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const {user} = require('../../models/user');
const {userGroup} = require ('../../models/userGroup');
/*************** Render & datas ***************/
var renderGestCompt = function (req,res,users,userGroups){
  res.render("gestion-comptes", {
    title: 'Gestion comptes',
    pageHeader: {
      title:'Gestion des comptes',
      strapline: "todo"
    },
    users : users,
    userGroups: userGroups
  });
}
/*************** Function called by routes ***************/
module.exports.displayGestCompt= async function displayGestCompt (req,res) {
  // req res useful ? 
  try { 
    let users = await user.getAllUsersNameRole(); 
    let userGroups = await userGroup.getAllUserGroups();
    users = users.map(e => e.toJSON());
    userGroups = userGroups.map(e => e.toJSON());
    renderGestCompt(req,res,users,userGroups);
  }
  catch (err) {
    throw err; 
  }
};

