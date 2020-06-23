  /*jslint node:true*/
/*eslint-env node*/
'use strict';
var moment = require('moment-timezone');
const {sensorGroup} = require('../../models/sensorGroup');
const {storedDatas} = require('../../models/storedDatas')
const {jsH, chunkArray} = require ('../helpers/jsHelpers')
/*************** Render & datas ***************/
var renderHistoryPage = function (req,res,sensorsDatas,groupInfos){
  res.render('history', { 
    styles: [],
    headScripts: [],
    bodyScripts: ["history.js"],
    title: 'Datas History',
    pageHeader: {
      title:'Historique des données ',
      //strapline: 'Date/heure - Lieu'
    },
    sensDatas: sensorsDatas,
    group: groupInfos
  });
}

/// tmp here 
// build datas array 
var buildDateDatasArray= function(storedJson,tz) {
  var dateDatasArray = []; 
  var dateArray = []; 
  var dataArray = []; 
  var date; 
  var value; 
  for (var i=0; i<storedJson.length; i++) {
      date = moment(storedJson[i].date).tz(tz).format('MMMM Do YYYY, h:mm:ss a'); 
      value = storedJson[i].value; 
      dateArray.push(date);
      dataArray.push(value); 
  }
  dateDatasArray = {"dates":dateArray,"datas": dataArray};
  return dateDatasArray; 
};
  
/*************** Function called by routes ***************/
module.exports.displayDatasHistory = async function (req, res) {
  try {
    var sensorsDatas = [];
    var datasTmp, sensor,sensorInfos,datasTime, allInfos; 
    // new : 
    // send array with each sensors and its datas 
    // get group 
    var group = await sensorGroup.getSensorGroupById(req.params.groupId); 
    var groupDatas = {"name":group.name,"id":group.groupId, "tz": group.timezone};
    for (var i=0; i<group.sensors.length; i++) {
      sensor = group.sensors[i]; 
      sensorInfos = {name: sensor.name, id: sensor.sensorId, metric: sensor.metric, unit: sensor.data.unit} ;
      datasTmp = await storedDatas.getAllDatas(sensor.sensorId) ;
      datasTime = buildDateDatasArray(datasTmp,group.timezone);
      allInfos = {"sensInfos":sensorInfos, "datasTime":datasTime};
    //build array 
      sensorsDatas.push(allInfos);
    }
    // todo sélectionner juste groupId : name : timezone pour le group 
    sensorsDatas = chunkArray(sensorsDatas,2);
    renderHistoryPage(req,res,sensorsDatas,groupDatas);
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};