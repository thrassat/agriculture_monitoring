  /*jslint node:true*/
/*eslint-env node*/
'use strict';
var moment = require('moment-timezone');
const {sensorGroup} = require('../../models/sensorGroup');
const {storedDatas} = require('../../models/storedDatas');
const {jsH, chunkArray} = require ('../helpers/jsHelpers');
var sendJsonResponse ;
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/*************** Render & datas ***************/
var renderHistoryPage = function (req,res,sensorsDatas,groupInfos){
  res.render('history', { 
    styles: ['tail.datetime-default-green.min.css','rome.min.css'],
    headScripts: [],
    bodyScripts: [],
    title: 'Datas History',
    pageHeader: {
      title:'Historique des données ',
      //strapline: 'Date/heure - Lieu'
    },
    sensInfos: sensorsDatas,
    group: groupInfos
  });
}

// FOR USER ROLE 
var renderUserHistoryPage = function (req,res,sensorsDatas,groupInfos){
  res.render('history', { 
    styles: ['tail.datetime-default-green.min.css','rome.min.css'],
    headScripts: [],
    bodyScripts: [],
    title: 'Datas History',
    layout: 'mainUser',
    pageHeader: {
      title:'Historique des données ',
      //strapline: 'Date/heure - Lieu'
    },
    sensInfos: sensorsDatas,
    group: groupInfos
  });
}

  
/*************** Functions called by routes ***************/
module.exports.displayDatasHistory = async function (req, res) {
  try {
    var sensorsInfos = [];
    var sensor,sensorObject; 
    // new : 
    // send array with each sensors and its datas 
    // get group 
    var group = await sensorGroup.getSensorGroupById(req.params.groupId); 
    var groupDatas = {"name":group.name,"id":group.groupId, "tz": group.timezone};
    for (var i=0; i<group.sensors.length; i++) {
      sensor = group.sensors[i]; 
      sensorObject= {"name": sensor.name, "id": sensor.sensorId, "metric": sensor.metric, "unit": sensor.data.unit} ;
      sensorsInfos.push(sensorObject);
    }
    sensorsInfos = chunkArray(sensorsInfos,2);
    if (req.user.role ==='superadmin' || req.user.role ==='admin') {
      renderHistoryPage(req,res,sensorsInfos,groupDatas);
    }
    else {
      renderUserHistoryPage(req,res,sensorsInfos,groupDatas);
    }
   
  } 
  catch(err) {

    console.log(err); 
    // todo how to handle error ?
  }
};
/* first try : passing all datas directly  
    datasTmp = await storedDatas.getAllDatas(sensor.sensorId) ;
      datasTime = buildDateDatasArray(datasTmp,group.timezone);
      allInfos = {"sensInfos":sensorInfos, "datasTime":datasTime};
*/
module.exports.getDatas = async function (req,res) {
  //OlD ? 
  try { 
    // via query parameter ou aller le chercher directement ici 
    var tz,range,sensorId,nowTmp,now,from,datas,dateDataArray ; 
    tz = req.query.tz; 
    range = req.query.range; 
    // console.log(req.params.groupId)
    sensorId = req.params.sensorId; 
    nowTmp = moment().tz(tz);
    now = moment().tz(tz); 
    switch(range) {
      case 'day':
        from = nowTmp.subtract(1,'days'); 
        datas = await storedDatas.getDatasFromTo(sensorId,from.format(),now.format()); 
        break;
      case 'week':
        from = nowTmp.subtract(7,'days');  
        datas = await storedDatas.getDatasFromTo(sensorId,from,now); 
        break; 
      case 'month':
        from = nowTmp.subtract(1, 'months');
        datas = await storedDatas.getDatasFromTo(sensorId,from.format(),now.format()); 
        break;
      case 'year':
        from = nowTmp.subtract(1,'years');
        datas = await storedDatas.getDatasFromTo(sensorId,from.format(),now.format()); 
        break;
      case 'ever':
        datas = await storedDatas.getAllDatas(sensorId); 
        break; 
      default: 
        console.log("todo default case");
        break; 
    } 
    dateDataArray = buildArrayDateDatas(datas,tz); 
    sendJsonResponse(res,200,dateDataArray);
  }
  catch (err) {
    console.log(err)
    sendJsonResponse(res,404, {
      "message": "get datas for chart error "
    });
  // todo throw error ?
  }
}

// build datas array 
var buildArrayDateDatas = function(storedJson,tz) {
  var dateDatasArray = []; 
  var dateArray = []; 
  var dataArray = []; 
  var date; 
  var value; 
  for (var i=0; i<storedJson.length; i++) {
      date = moment(storedJson[i].date).tz(tz).format(); 
      value = storedJson[i].value; 
      dateArray.push(date);
      dataArray.push(value); 
  }
  dateDatasArray = {"dates":dateArray,"datas": dataArray};
  return dateDatasArray; 
};
