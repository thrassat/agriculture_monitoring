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
      strapline: 'Voici la liste des groupes de capteurs confirmés auxquels vous avez accès' //todo
    },
  
    //get all sensors groups  , return all fields to index
    //change names 
    // todo return au niveau de la request du model ou a une autre étape que ce qui nous intéresse
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
    //get all sensors groups  , return all fields to index
    //change names 
    // todo return au niveau de la request du model ou a une autre étape que ce qui nous intéresse
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
    
    //Fixing Handlebars issue: Access has been denied to resolve the property "uniqueid" because it is not an "own property" of its parent.
    // https://github.com/handlebars-lang/handlebars.js/issues/1642 
    // console.log("inside render index  ")
    // console.log(req.user)
    // console.log(groups)
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
          // todo check if access can be provided by an user groups 
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
        // todo ajouter voir si selon le groupe utilisateur a accès  
        if (index > -1) {
          // a accès 
          displayGroups.push(storedGroups[i]);
        }
        else {
          // n'a pas accès
          // todo check if access can be provided by an user groups 
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

    // implement methode : user.getUserGroupsAccessArray 
    // else if (user.role ==='admin' || user.role ==='user') {
    //   // Pour admin et user  -- accès via leur groups ??? 
    //   var test = []; 
    //   if (user.group) {
    //     console.log(user.group)
    //     for (var i=0;i<user.group.length;i++) {
    //       let groupName=user.group[i].name; 
    //       for(var j=0;j<groups.length;j++) {
    //         let index = user.group[i].accessTo.indexOf(groups[i].groupId);
    //         // probleme dans cette logique car on supprime un accès , alors que le groupe utilisateur est plutot là pour en ajouter
    //         // idée checker ça a chaque suppression d'acces potentiel user 
    //         // faire un array de tout les autres accès ici : en supprimer les doublons et checker leur présence avant suppressioN? 
    //       }
    //     }
    //   }
      // else {
      //   console.log('pas duser group')
      // }
    //   if (user.role === 'admin') {
    //     for (var i=0;i<groups.length;i++) {
    //       // groups[i].groupId vs les id dans accessTo : garder les groups présents dans accessTo seulement 
    //       let index = user.accessTo.indexOf(groups[i].groupId);
    //       // todo ajouter voir si selon le groupe utilisateur a accès  
    //       if (index === -1) {
    //         // a pas accès 
    //         groups.splice(groups[i],1);
    //       }
    //     }
    //   } 
    //   else if (user.role === 'user') {
  
    //   }
    //   else { //impossible ? 
    //   }
    // }
    // else {
    //   // impossible etre ici normalement 
    //   throw new Error("Prolème de rôle associé au compte");
    // }
 
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

/*************** Function called by routes ***************/
/*GET 'ALL SENSORS GROUPS AVAILABLE FOR INDEX PAGE */
/*module.exports.listAccessibleSensorGroups = async function (req,res) {
  // remove req where unuseful? 
//https://www.twilio.com/blog/5-ways-to-make-http-requests-in-node-js-using-async-await
  try {
    const response = await axios.get('/api/v0/index') ;
    renderIndex(req,res,response.data); 
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};*/
/* FIRST VERSION */
/*
module.exports.listAccessibleSensorGroups1 = function (req, res) {//passing datas to the view  
  axios({
    method: 'get',
    url: '/api/v0/index',
  // responseType: 'JSON' ? JSON parse by default 
  })
    // .then(function (response) {
    //   response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
    // });
  .then(function (response) {
    //console.log(response);
    //console.log(response.data);
    renderIndex(req,res,response.data);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    // always executed
  }); 
  
  //renderIndex(req,res);
};*/



