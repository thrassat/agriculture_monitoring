  /*jslint node:true*/
/*eslint-env node*/
'use strict';
const {userGroup} = require('../../models/userGroup') ; 
const {sensorGroup} = require('../../models/sensorGroup'); 
var morgan = require('morgan'); 

// from https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript 
var chunkArray = function (myArray, chunk_size){
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];
  var myChunk; 
  for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index+chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
  }
  return tempArray;
}

/*************** Render & datas ***************/
var renderIndex = function (req,res,sensorGroupsList,errors){
  res.render("index", {
    title: 'Index',
    pageHeader: {
      title:'Groupes de capteurs accessibles : ',
      strapline: 'Voici la liste des groupes de capteurs confirmés auxquels vous avez accès' 
    },
    sensorGroupsList: sensorGroupsList,
    errors: errors,

  });
}

// RENDER FOR USER ROLE : 
var renderUserIndex = function (req,res,sensorGroupsList,errors){
  res.render("index", {
    title: 'Index',
    pageHeader: {
      title:'Groupes de capteurs accessibles : ',
      strapline: 'Voici la liste des groupes de capteurs confirmés auxquels vous avez accès' //todo
    },
    layout: 'mainUser',
    sensorGroupsList: sensorGroupsList,

    errors: errors,

  });
}


/*************** Function called by routes ***************/
/*GET 'ALL SENSORS GROUPS AVAILABLE FOR INDEX PAGE */
module.exports.renderIndexWithDatas = async function renderIndexWithDatas (req,res) {
  // req res useful ? 
  try { 
    var errors = []; 
    let storedGroups = await sensorGroup.getAllConfirmedSensorGroups(); 
    let displayGroups = [] ;
    

    let user = req.user ;  
    // keep only autorized groups 
    
    if (user.role === 'superadmin') {
      // rien ? 
      displayGroups = storedGroups; 
    }
    else if (user.role === 'admin') {
      for (var i=0;i<storedGroups.length;i++) {
        // groups[i].groupId vs les id dans accessTo : garder les groups présents dans accessTo seulement 
        let index = user.accessTo.indexOf(storedGroups[i].groupId);
        if (index > -1) {
          displayGroups.push(storedGroups[i])
        }
        else {
          // n'a pas accès
          // check if access can be provided by an user groups 
          let hasAccess = await userGroup.isBelongingUserGroupAccess(user.group,storedGroups[i].groupId);
          if (hasAccess) {
            displayGroups.push(storedGroups[i]); 
          }
        }
      }
    } 
    else if (user.role === 'user') {
      for (var i=0;i<storedGroups.length;i++) {
        // groups[i].groupId vs les id dans accessTo : garder les groups présents dans accessTo seulement 
        let index = user.accessTo.indexOf(storedGroups[i].groupId);
        if (index > -1) {
          // a accès 
          displayGroups.push(storedGroups[i]);
        }
        else {
          // n'a pas accès
          // check if access can be provided by an user groups 
          let hasAccess = await userGroup.isBelongingUserGroupAccess(user.group,storedGroups[i].groupId);
          if (hasAccess) {
            displayGroups.push(storedGroups[i]); 
          }
        }
      }
    }
    else {
      // impossible etre ici normalement 
      throw new Error("Prolème de rôle associé au compte");
    }
    //Fixing Handlebars issue: Access has been denied to resolve the property "uniqueid" because it is not an "own property" of its parent.
    // https://github.com/handlebars-lang/handlebars.js/issues/1642 
    displayGroups = displayGroups.map(e => e.toJSON());
    var chunked = chunkArray(displayGroups,3);
    if (user.role === 'admin' || user.role ==='superadmin') {
      renderIndex(req,res,chunked,errors);
    }
    else {
      renderUserIndex(req,res,chunked,errors);
    }
   
  }
  catch (err) {
    console.log(err)
    errors.push(err) ; 
    //morgan.log(err);
  }
};
