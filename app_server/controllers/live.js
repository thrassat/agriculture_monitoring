  /*jslint node:true*/
/*eslint-env node*/

var moment = require('moment-timezone');
const {sensorGroup} = require('../../models/sensorGroup');
const {storedDatas} = require('../../models/storedDatas');
const {jsH, chunkArray} = require ('../helpers/jsHelpers'); 
/*************** Render & datas ***************/
var renderLivePage = function (req,res,datasInfo,groupId){
  res.render('live', {  //'locationlist in getting mean
    title: 'Live datas',
    pageHeader: {
      title:'Données en temps réel ',
      strapline: 'Capteurs disponibles et leur(s) dernière(s) donnée(s) enregistrée(s)'
    },
    datasInfo: datasInfo,
    groupId: groupId
  });
}

var renderUserLivePage = function (req,res,datasInfo,groupId) {
  res.render('live', {
    title: 'Live datas', 
    pageHeader: {
      title: 'Données en temps réel', 
      strapline: 'Capteurs disponibles et leur(s) dernière(s) donnée(s) enregistrée(s)' 
    }, 
    layout: 'mainUser',
    datasInfo: datasInfo,
    groupId: groupId
  });

};

/*************** Function called by routes ***************/
module.exports.renderLiveWithDatas = async function renderLiveWithDatas (req, res) {
  try {
    var groupId = req.params.groupId;
    var dataArray = [];
    // aller chercher les données sur ce sensor group 
    // les dernieres données
    // creer des array pour envoyer tout ça 
    var group = await sensorGroup.getSensorGroupById(groupId); 
    var sensors = group.sensors; 
    // plutot méthode getConfirmedSensors ou afficher "please confirm sensor pour ceux qui le sont pas "
    // gérer côté front affichage des confirmed or not 
    for (var i=0 ; i<sensors.length; i++) {
      if (sensors[i].confirmed) {
        // check integer ? 
        if (sensors[i].data.type === 'number') {
          var dataPacket = await storedDatas.getLastDataByIds(groupId,sensors[i].sensorId);

          if (dataPacket) {
            var timestamp = moment(dataPacket.date).tz(group.timezone).format('MMMM Do YYYY, h:mm:ss a');
            dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId, "sensMetric":sensors[i].metric,"sensDataInfos":sensors[i].data,"sensConfirmation": true,"sensLastDataValue":dataPacket.value, "sensLastDataDate": timestamp});
          }
          else {
            dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId, "sensMetric":sensors[i].metric,"sensDataInfos":sensors[i].data,"sensConfirmation": true});
          }
        }
        else {
          //dataType is not number 
          // si l'implémentation de d'autres type est prévu faire ici 
          // sinon pour l'instant traité comme un entier 
          let dataPacket = await storedDatas.getLastDataByIds(groupId,sensors[i].sensorId);
          if (dataPacket) {
            dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId, "sensMetric":sensors[i].metric,"sensDataInfos":sensors[i].data,"sensConfirmation": true,"sensLastDataValue":dataPacket.value,"sensLastDataDate":dataPacket.date});
          }
          else {
            dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId, "sensMetric":sensors[i].metric,"sensDataInfos":sensors[i].data,"sensConfirmation": true  });
          }
       }
      }
      else {
        // sensor not confirmed : gather data ? 
        dataArray.push({"sensName":sensors[i].name,"sensId":sensors[i].sensorId,"sensConfirmation": false});
      }
    }
   // dataArray = dataArray.map(e => e.toJSON() ); 
    var chunked = chunkArray(dataArray,3);
    if (req.user.role === 'superadmin' || req.user.role ==='admin') {
      renderLivePage(req,res,chunked,groupId)
    }
    else {
      renderUserLivePage(req,res,chunked,groupId)
    } 
  }
  catch (err) {
    // handler error ? Throw ? Nothing? 
    console.log(err); 
    // add to array error and display ? 
  }
};

