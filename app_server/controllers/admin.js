  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const {sensorGroup} = require('../../models/sensorGroup') 
/*************** Render & datas ***************/
var renderAdmin = function (req,res,sensorGroupsList){
  res.render("admin", {
    title: 'Admin',
    pageHeader: {
      title:'Admin todo ',
      strapline: 'Date/heure - Lieu' //todo
    },
    //get all sensors groups  , return all fields to index
    //change names 
    // todo return au niveau de la request du model ou a une autre étape que ce qui nous intéresse
    sensorGroupsList: sensorGroupsList,
  });
}
/*************** Function called by routes ***************/
/*GET 'ALL SENSORS GROUPS AVAILABLE FOR INDEX PAGE */
module.exports.renderAdminWithDatas = async function renderAdminWithDatas (req,res) {
  // req res useful ? 
  try { 
    let groups = await sensorGroup.getAllUnconfirmedSensorGroups(); 
    //Fixing Handlebars issue: Access has been denied to resolve the property "uniqueid" because it is not an "own property" of its parent.
    // https://github.com/handlebars-lang/handlebars.js/issues/1642 
    groups = groups.map(e => e.toJSON());
    renderAdmin(req,res,groups);
  }
  catch (err) {
    throw err; 
  }
};