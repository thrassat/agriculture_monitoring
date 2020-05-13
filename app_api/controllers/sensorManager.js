const mongoose = require('mongoose');
const {sensorGroup} = require('../models/sensorGroup') // récupère le Model crée 
const {storedDatas} = require('../models/storedDatas')
var sendJsonResponse ;
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/**********************************************************/
/*               ADD SENSOR GROUP                         */
/**********************************************************/
// todo jsdoc https://stackoverflow.com/questions/27266857/how-to-annotate-express-middlewares-with-jsdoc
// groupId en paramètre request
// name, timezone, owners, dans le body request 
// Ajout des sensors ensuite

module.exports.addSensorGroup = async function (req,res) {
    // todo voir comment gérer dans l'appli mais potentiellement via la request body pour l'ensemble des infos
    try {
        // todo save with id de l'arduino ? req.params.groupid
        let status = await sensorGroup.addSensorGroup(req.params.groupid,req.body.name,req.body.timezone,req.body.owners);
        if (status!=201) {
            throw new Error("Error adding sensor group");
            //laisser ?  
        }
        else {
            sendJsonResponse(res,status,{
                "message": "Sensor group added"
            });
        }
    }
    catch (err) {
        // todo how to handle error inserting sensor group ? Send info to user
        console.log(err);
        sendJsonResponse(res,500,{
            "message": "Error adding sensor group"
        });

    }
};
/********************************************************************/
/*               ADD SENSOR TO SENSOR GROUP                         */
/********************************************************************/
// request params : Id , datatype ? 
// body : name 
module.exports.addSensorToGroup = async function (req,res) {
    try{
         // todo save with id de l'arduino ? req.params.groupid
         let status = await sensorGroup.addSensor(req.params.groupid,req.body.name,req.params.datatype);
         if (status!=201) {
             throw new Error("Error adding sensor");
             //laisser ?  
         }
         else {
             sendJsonResponse(res,status,{
                 "message": "Sensor added"
             });
         }
    }
    catch(err) {
        console.log(err); 
        sendJsonResponse(res,status, {
            "message": "Error adding sensor"
        })
    }
};