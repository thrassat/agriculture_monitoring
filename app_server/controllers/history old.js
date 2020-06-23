  /*jslint node:true*/
/*eslint-env node*/
'use strict';
var moment = require('moment-timezone');
const axios = require('axios').default;
axios.defaults.baseURL = "http://localhost:3000";

if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = "https://quiet-mountain-46017.herokuapp.com/"
};
//axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

/*************** Render & datas ***************/
var renderHistoryPage = function (req,res,sensorId,groupName,timezone){
  res.render('history', { 
    styles: [],
    headScripts: [],
    bodyScripts: ["history.js"],
    title: 'Datas History',
    pageHeader: {
      title:'Historique des données ',
      //strapline: 'Date/heure - Lieu'
    },
    sensorId: sensorId,
    //datas: datas,
    groupName: groupName,
    timezone: timezone,

  });
}
/*************** Function called by routes ***************/
module.exports.displayDatasHistory = async function (req, res) {
  try {
    var sensorId = req.params.sensorid; 
    var sensorGroupId = req.params.sensorid.split('-')[0]; 
    // ces infos une fois totalement ciblée peuvent être éventuellement passées depuis le click d'accès à cette page
    var sensorgroupinfos = await axios.get('/api/v0/groupinfos/'+sensorGroupId);  
    var groupName = sensorgroupinfos.data.name; 
    var timezone = sensorgroupinfos.data.timezone;  
    renderHistoryPage(req,res,sensorId,groupName,timezone);
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};