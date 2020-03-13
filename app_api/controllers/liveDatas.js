const mongoose = require('mongoose');
//Bring the "consultation schema", created on: models/consultations
//Models folder moves from app_server to app_api

var sensorGroupModel = mongoose.model('SensorGroup');
var datas = mongoose.model('StoredData');
var sendJsonResponse ;

// Idee : commencer la vrai appli comme si je consultais en superadmin 
// Accueil : accès au différentes pages des sensorGroups 
// TODO : séparé en plusieurs file = paar vue ou par model ? 

module.exports.test = function (req,res) {
    sensorGroupModel
        .find()
        .exec(function(err,found) {
            sendJsonResponse(res,200,found) 
        });
};

//todo other page!
// module.exports.readAllSensorGroups = function (req,res) {
//     if (req.params) {
//         sensorGroupModel
//             .find()
//             .exec(function(err,sensorGroups) {
//                 if (!sensorGroups) {
//                     sendJsonResponse(res,404, {
//                         "message": "Sensor Group list not found"
//                     });
//                     return;
//                 } else if (err) {
//                     sendJsonResponse(res, 404, err);
//                     return;
//                 }
//                 sendJsonResponse(res,200,sensorGroups);
//             });       
//     } else {
//         sendJsonResponse(res,404, {
//             "message": "request error"
//         });
//     }
//  //   get back geting mean p207
// }
// works : http://localhost:3000/api/v0/livedatas/5e58375ebab525657c4e0266 
module.exports.readOneSensorGroup = function (req,res) {
    if (req.params && req.params.sensorgroupname) {
        sensorGroupModel
            .findOne({name: req.params.sensorgroupname})
            // Ou .findByid version particulière de findone({_id: id}) avec un field choisi par nous
            .exec(function(err,sensorgroup) {
                if (!sensorgroup) {
                    sendJsonResponse(res,404, {
                        "message": "Sensor Group not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res,200,sensorgroup);
            });
    } else {
        sendJsonResponse(res,404, {
            "message": "No Sensor Group Id in request"
        });
    }
};

// Ajout d'un sensor group 
module.exports.addOneSensorGroup = function (req,res) {
 // ajout de tout sauf capteurs ? et ajout un a un ensuite ?
    console.log(req.body);
    var sensorgroup = new sensorGroupModel({
        // comment ajouter les checks pour l'ajout ? TODO
        name: req.body.name,
        owners: req.body.owners,
        //todo owners a insérer correctement 
        sensors: req.body.sensors, 
        //PB : si a null et que unique va générer des erreurs! 
    }); 
    sensorgroup.save(function(err,inserted){
        if (err) {
            console.log(err);
            sendJsonResponse(res, 400, inserted) ;
        } else {
            sendJsonResponse(res, 201, inserted) ;
        }
    });
};
// suppression d'un sensor group 
// modif d'un sensor group 
// Ajout d'un capteur 
module.exports.addOneSensor = function (req,res) {
    // besoin d'argument du sensor group visé et des caractéristique du capteurs à enregistrer
    sensorGroupModel.sensors.push
};
// suppression d'un capteur 
// modif d'un capteur 
// Lire info d'un capteur 
module.exports.readOneSensor = function (req,res) {
    if (req.params && req.params.sensorgroupname && req.params.sensorid) {
        sensorGroupModel
            .findOne({name: req.params.sensorgroupname})
            .select('sensors')
            .exec(
                function (err,sensorgroup) {
                    var sensor,response;
                    if(!sensorgroup) {
                        sendJsonResponse(res, 404, {
                            "message" : "Sensor Group not found"
                        });
                        return;
                    } else if (err) {
                        sendJsonResponse(res, 400, err); 
                        return;
                    }

                    if (sensorgroup.sensors && sensorgroup.sensors.length>0) {
                        sensor = sensorgroup.sensors.id(req.params.sensorid);
                        if (!sensor) {
                            sendJsonResponse(res, 404, {
                                "message" : "Sensor Id not found"
                            });
                        } else { // send sensor infos (potentiel object response si besoin d'autre field)
                            sendJsonResponse(res, 200, sensor);
                        }
                    } else {
                        sendJsonResponse(res, 404, {
                            "message" : "No sensor found"
                        }); 
                    }
                    sensor = sensorgroup.sensors.id(req.params.sensorid);
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message" : "Not found, Sensor Group id & Sensor id required"
        });
    }
};

/*
Le group sensor : 5e58375ebab525657c4e0266
Chaque UUID SENSOR 
e44a5322-78f1-40b9-946d-be9ad416679c
b69024cb-f83a-4528-afba-8139be865675
d281a2fb-8300-4c2a-affc-63476bc14f00*/ 
/* TESTING PART */ 

module.exports.listTrios = function (req,res) { 
    sendJsonResponse(res, 200, {"status" : "success"});
};

// works : http://localhost:3000/api/v0/datas/5e4b06d593fd4269ffe8b5de
module.exports.readOne = function(req,res) {
    if (req.params && req.params.trioid) {
        Consult
            .findById(req.params.trioid)
            //.select('temp rh')
            .exec(function(err, consultations) {
                if(!consultations) {
                    sendJsonResponse(res, 404, {
                        "message" : "'trioid' not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 200, consultations);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message" : "No 'trioid' in request"
        });
    }
};

module.exports.addTrio = function (req,res) { 
    Consult.create({
        // validating data in the schema with flags : require, default, minmax...
        temp: req.body.temp,
        rh: req.body.rh,
        co2: req.body.co2,
        "timestamp": req.body.timestamp 
    }, function (err, consultations) {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, consultations);
        }
    });
};

//update ainsi supprimera les paramètres non mis dans la request 
module.exports.updateTrio = function (req,res) { 
    if (!req.params.trioid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, 'trioid' is required"
        });
        return;
    }    
    Consult
        .findById(req.params.trioid)
        .exec(
            function(err,consultations) {
                if (!consultations) {
                    sendJsonResponse(res, 404, {
                        "message": "'trioid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                consultations.temp = req.body.temp;
                consultations.rh = req.body.rh;
                consultations.co2 = req.body.co2;
                consultations.timestamp = req.body.timestamp;
            
                consultations.save(function(err,consultations) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, consultations);
                    }
                });
            }
    );
};

module.exports.deleteTrio = function (req,res) { 
    var trioid = req.params.trioid;
    if (!trioid) {
        //pas utile car sinon ne serait pas routé là ? 
        sendJsonResponse(res, 404, {
            "message": "Not found, 'trioid' is required"
        });
        return; 
    }    
    Consult
        .findByIdAndRemove(trioid)
        .exec(
            function(err,consultations) {
                if (!consultations) {
                    sendJsonResponse(res, 404, {
                        "message": "'trioid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                sendJsonResponse(res, 204, null); 
            }
    );
};

sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};