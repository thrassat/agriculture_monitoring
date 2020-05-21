  /*jslint node:true*/
/*eslint-env node*/
'use strict';
var moment = require('moment-timezone');
const {sensorGroup} = require('../../models/sensorGroup')
const {storedDatas} = require('../../models/storedDatas')

/*************** Render & datas ***************/
var renderLivePage = function (req,res,datasInfo){
  res.render('live', {  //'locationlist in getting mean
    title: 'Live datas',
    pageHeader: {
      title:'Données en temps réel ',
      //strapline: 'Date/heure - Lieu'
    },
    datasInfo: datasInfo,
  });
}

/*************** Function called by routes ***************/
module.exports.renderLiveWithDatas = async function renderLiveWithDatas (req, res) {
  try {
    var groupId = req.params.groupid;
    // get live/:groupid parameter 
    console.log(req.params.groupid);
    // get "?" parameter
    // si ajout de ?name={{this.name}} après le lien cliquable d'index.handlebars
    //console.log(req.query.name)
    // aller chercher les données sur ce sensor group 
    // les dernieres données
    // creer des array pour envoyer tout ça 
    

    renderLivePage(req,res,"")
  
  }
  catch (err) {
    // handler error ? Throw ? Nothing? 
    console.log(err); 
  }
};


  // OLD  // getting all sensors for this group
  //   // for each : name, last data value, unit & timestamp 
  //   var groupId = req.params.groupid;   
  //   var sensorsAndTimezone = await sensorGroup.getSensorsAndTimezoneByGroupId(groupId); 
  //   var sensors = sensorsAndTimezone.sensors; 
  //   var timezone = sensorsAndTimezone.timezone; 
  //   var dataPacket, name, dataType, value, unit, timestamp; 
  //   var dataArray = []; 
  //   for (var i=0; i < sensors.length; i++) {
  //     dataPacket =  await storedDatas.getLastDataBySensorId(sensors[i].sensorid) ;
  //       //getting name of the sensor
  //       name = sensors[i].name; 
  //       //creating array to send to the page
  //       value = dataPacket.value; 
  //       timestamp = moment(dataPacket.date).tz(timezone).format();
  //       dataType = sensors[i].data.type;
  //       unit = sensors[i].data.unit;
  //       dataArray.push({"name": name,"type":dataType, "value":value, "unit":unit, "timestamp":timestamp, "id":sensors[i].sensorid}); 
  //     };
  //     renderLivePage(req,res,dataArray);