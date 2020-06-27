  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const {user} = require('../../models/user') 
/*************** Render & datas ***************/
var renderGestCompt = function (req,res,users){
  res.render("gestion-comptes", {
    title: 'Gestion comptes',
    pageHeader: {
      title:'Gestion des comptes',
      strapline: "todo"
    },
    users : users,
  });
}
/*************** Function called by routes ***************/
module.exports.displayGestCompt= async function displayGestCompt (req,res) {
  // req res useful ? 
  try { 
    let users = await user.getAllUsersNameRole(); 
    users = users.map(e => e.toJSON());
    renderGestCompt(req,res,users);
  }
  catch (err) {
    throw err; 
  }
};

