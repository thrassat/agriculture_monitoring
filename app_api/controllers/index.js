const mongoose = require('mongoose');
//Bring the "consultation schema", created on: models/consultations
//Models folder moves from app_server to app_api

var sensorGroupModel = mongoose.model('SensorGroup');
var sendJsonResponse ;

sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// Accueil : accès au différentes pages des sensorGroups 
// TODO : séparé en plusieurs file = paar vue ou par model ? 

//todo other page!
module.exports.readAllSensorGroups = function (req,res) {
    if (req.params) {
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
                sendJsonResponse(res,200,sensorGroups);
            });       
    } else {
        sendJsonResponse(res,404, {
            "message": "request error"
        });
    }
 //   get back geting mean p207
} 
