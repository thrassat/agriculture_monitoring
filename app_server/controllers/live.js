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
      strapline: 'Capteurs disponibles et leur dernière donnée enregistrée'
    },
    datasInfo: datasInfo,
  });
}

/*************** Function called by routes ***************/
module.exports.renderLiveWithDatas = async function renderLiveWithDatas (req, res) {
  try {
    var groupId = req.params.groupid;
    var dataArray = [];
    // get live/:groupid parameter 
    console.log(req.params.groupid);
    // get "?" parameter
    // si ajout de ?name={{this.name}} après le lien cliquable d'index.handlebars
    //console.log(req.query.name)
    // aller chercher les données sur ce sensor group 
    // les dernieres données
    // creer des array pour envoyer tout ça 
    let group = await sensorGroup.getSensorGroupById(groupId); 
    let sensors = group.sensors; 
    // plutot méthode getConfirmedSensors ou afficher "please confirm sensor pour ceux qui le sont pas "
    // gérer côté front affichage des confirmed or not 
    console.log(sensors);
    for (var i=0 ; i<sensors.length; i++) {
      if (sensors[i].confirmed) {
        // check integer ? 
        if (sensors[i].data.type === 'number') {
          let dataPacket = await storedDatas.getLastDataByIds(groupId,sensors[i].sensorId);
          // this ?
          // la valeur se retrouve mais ne s'affiche pas ... utiliser propre array
         // sensors[i].lastData = dataPacket.value; 
        //  sensors[i][timestamp] = dataPacket.date; 
          //sensors[i].push({"lastData":dataPacket.value, "timestamp":dataPacket.date}); 
          // or build own array 
          // console.log("djij")
          // console.log(typeof sensors[i])
          // console.log(sensors[i].lastData)
          // console.log(sensors[i].date)
          // console.log(sensors[i])
          dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId, "sensMetric":sensors[i].metric,"sensDataInfos":sensors[i].data,"sensConfirmation": true,"sensLastData":dataPacket});
        }
        else {
          //dataType is not number 
          // si l'implémentation de d'autres type est prévu faire ici 
          // sinon pour l'instant traité comme un entier 
          let dataPacket = await storedDatas.getLastDataByIds(groupId,sensors[i].sensorId);
          dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId, "sensMetric":sensors[i].metric,"sensDataInfos":sensors[i].data,"sensConfirmation": true,"sensLastData":dataPacket});
       }
      }
      else {
        // sensor not confirmed : gather data ? 
        dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId,"sensConfirmation": false});
      }
    }
    renderLivePage(req,res,dataArray)
  
  }
  catch (err) {
    // handler error ? Throw ? Nothing? 
    console.log(err); 
    // add to array error and display ? 
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