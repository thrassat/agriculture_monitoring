const mongoose = require('mongoose');
//Bring the "consultation schema", created on: models/consultations
//Models folder moves from app_server to app_api

//var sensorGroupModel = mongoose.model('SensorGroup');
const {sensorGroup} = require('../models/sensorGroup') 
var sendJsonResponse ;
// todo add has helper

sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// Accueil : accès au différents sensorGroups 

/************************************************/
/*          GET ALL SENSOR GROUPS               */
/************************************************/
module.exports.getAllSensorGroups = async function (req,res) {
    try {
        groups = await sensorGroup.getAllSensorGroups(); 
        sendJsonResponse(res,200,groups);
    }
    catch (err) {
        sendJsonResponse(res,404, {
            "message": "get all sensors request error"
        });
        // todo throw error ?
    }
    return;
}

// First version getAllSensorGroups
/*
module.exports.readAllSensorGroups = function (req,res) {
    console.log(req.params); 
    if (req.params) {
        // TODO SORTIR LA REQUEST D'ICI et la mettre dans le modèle : invoyer : getAllSensorGroups
        sensorGroupModel
            .find()
            .exec(function(err,sensorGroups) {
                if (!sensorGroups) {
                    sendJsonResponse(res,404, {
                        "message": "Sensor Group list not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                console.log(res); 
                //console.log(sensorGroups); 
                sendJsonResponse(res,200,sensorGroups);
            });       
    } else {
        sendJsonResponse(res,404, {
            "message": "request error"
        });
    }
 //   get back geting mean p207
} */
