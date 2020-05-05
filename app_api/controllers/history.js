const mongoose = require('mongoose');
var moment = require('moment-timezone');

const {sensorGroup} = require('../models/sensorGroup')
const {storedDatas} = require('../models/storedDatas')
var sendJsonResponse 
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/**********************************************************/
/*              GET SENSOR GROUP INFO BY ID               */
/**********************************************************/
module.exports.getSensorGroupInfos = async function (req,res) {
    try {
        // name & timezone mais on peut demaner plus/moins 
        let groupinfo = await sensorGroup.getSensorGroupInfosById(req.params.groupid); 
        sendJsonResponse(res,200,groupinfo); 
    }
    catch (err) {
        sendJsonResponse(res,404, {
            "message": "get sensor group info by id error "
        });
    }
    return; 
}


/************************************************/
/*              GET DATAS TEST                  */
/************************************************/
module.exports.getDatasTest = async function (req,res) {
    var dateDataArray = [];
    try {
        // date need to be on string format : converti explicitement en date ici ou par la méthode du modèle 
        datas = await storedDatas.getDatasFromTo("f39205955150484347202020ff132a1f-temp",'2019','2021'); 
        console.log(datas);
        // get timezone ? sinon pas bon forma pour la date
        for (var i=0; i<datas.length; i++) {
          //  dateDataArray.push({"date":})
        }
        sendJsonResponse(res,200,datas);
    }
    catch (err) {
        sendJsonResponse(res,404, {
            "message": "get datas test error "
        });
        // todo throw error ?
    }
    return;
}