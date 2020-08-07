const mongoose = require( 'mongoose');
      timestamps = require('mongoose-timestamp');

const {user} = require('./user')
const {storedDatas} = require('./storedDatas')

/*************************************************/
/*                  SUBDOCUMENTS                 */
/*************************************************/
/**************************************/
/*           Sensor Schema            */
/**************************************/
const sensorSchema = new mongoose.Schema({
    // on overwrite pas le ObjectID de MongoDB, mais on crée notre propre "id field" :: provenant du post Arduino !
    sensorId: {
        type: String,
        trim: true,
        required: true,
        index: true,
    },
    // indique si le capteur a été confirmé par un superadmin du côté de l'application (si non il ne pourra pas stocker de données)
    confirmed: {
        type: Boolean,
        required: true
    },
    // nom ajouté depuis l'application lors du paramétrage
    name: {
        type: String,
        trim: true,
    },
    // grandeur/métrique mesurée
    metric: {
        type: String,
        trim: true
    },
    // informations sur la donnée stockée (sous-document ne nécessitant pas de schéma particulier)
    data: {
        // Type de la donnée ; actuellement : integer seul le type "Number" est géré au niveau de l'application
        type: {
            type: String,
            trim: true
        },
        // potentielle valeur minimale que peut prendre la donnée
        min: {
            type : Number
        },
          // potentielle valeur maximale que peut prendre la donnée
        max : {
            type : Number
        },
        // Unité de la donnée
        unit : {
            type : String
         },
        // potentielle information sur la précision de la donnée
        precision: {
            type: String
        }
    },
});

/*************************************************/
/*                 MAIN DOCUMENT                 */
/*              SENSOR GROUP SCHEMA              */
/*************************************************/

var sensorGroupSchema = new mongoose.Schema({
  // groupId : 128bits envoyé par l'Arduino.
  // on overwrite pas le mongo objectid
   groupId: {
       type: String,
       trim: true,
       required: true,
       index: true
       // regexp ? potential todo
   },
   // indique si le groupe a été confirmé par un superadmin du côté de l'application (si non il ne pourra pas stocker de données)
   confirmed: {
       type: Boolean,
       required: true,
   },
     // nom ajouté depuis l'application lors du paramétrage
   name: {
       type: String,
       trim: true,
       sparse: true, //alow null values when registered and next filled with unique values
       unique: true
       //Unique fait aussi index
   },
    // timezone où sera placé le capteur
    // prevu pour stocker sur ce format de momentjs 'America/Toronto' ; 'Europe/Paris' (les 2 timezone actuellement gérées)
    // potential todo : en prendre plus en compte
   timezone: {
       type: String,
       trim: true,
       match: /[A-Z][a-z]+\/[A-Z][a-z]+/,
   },
   // Embarquement des sous-documents "sensor"
   sensors: [sensorSchema]
},
// nom de la collection mongoDB de ce schéma en base
{collection: 'sensorgroups'}
);

/**************************************/
/*               PLUGINS              */
/**************************************/
sensorSchema.plugin(timestamps); // automatically add created at and last update at
sensorGroupSchema.plugin(timestamps); // automatically add created at and last update at

/**************************************/
/*               ERRORS               */
/**************************************/
 // Message d'erreur customisé dans le cas d'une valeur déjà existante (potential todo : point de vue sécurité : s'assurer que ça ne renvoi pas trop d'informations)
//https://mongoosejs.com/docs/middleware.html
sensorGroupSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
      var field = error.errmsg.split("index:")[1].split("dup key")[0].split("_")[0];
      var value= error.errmsg.match(/\".*\"/);
 
      next(new Error('La valeur : '+value+ ' est déjà existante pour le champ "'+field.trim()+'" - Veuillez réessayer'));
    } else {
      next();
    }
  });
/****************************************************************************/
/*               ON DELETE, DELETE DEPENCIES (cascade delete)               */
/****************************************************************************/
// fonction appelée lorsqu'un sensor group est supprimé (appel de la méthode DeleteOne() après suppression d'un groupe depuis l'application)
sensorGroupSchema.pre('deleteOne', { document: true },async function(next) {
    try {
        // le groupId est potentiellement dans les array isAdmin et accessTo du user model --> suppression
        await user.deleteUsersDependenciesForGroupId(this.groupId);
        // les données stockées de ce group de capteur son aussi supprimées
        await storedDatas.deleteDatasDependenciesForGroupId(this.groupId);
        // ses dépendances ont été supprimées, le document de ce groupId est ensuite effectivement supprimé
    }
    catch (err) {
        throw err;
        // morgan ? How to handle
    }
});

// Pour la suppression d'un capteur, seule les données liées sont à supprimées et on n'appelle pas méthode Mongoose mais on gère l'array de subdocuments;
// la suppression des dépendances est gérée dans la méthode "deleteSensorById"


/*************************************************************************************************************************/
/*                                      STATIC SENSOR GROUP METHODS                                                      */
/*************************************************************************************************************************/
/**
 * @typedef sensor
 * @property {string} sensorId
 * @property {Boolean} confirmed
 * @property {string} name
 * @property {string} typeinfos todo
 *
 * @typedef owner
 * @property {string} userid
 *
 * @typedef sensorGroup
 * @property {String} groupId
 * @property {Boolean} confirmed
 * @property {String} name
 * @property {String} timezone
 * @property {Array.<sensor>} sensors
 *
 */

/*************************************************************************/
/*                      GETTERS METHODS  (READ)                          */
/*************************************************************************/

/**** GET SENSOR GROUP BY ID : *****/
/**
* Get all sensor group fields by ID
* @async
* @param {string} groupId
* @return {Promise.<sensorGroup>|Error} sensor group document, if doesn't exists "null"
* @throws throw error if query fails
*/
sensorGroupSchema.statics.getSensorGroupById = async function getSensorGroupById (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let group = await this.find({groupId: groupId}).exec() ;
            if (group.length==0) {
                resolve(null);
            }
            else if (group.length > 1) {
                reject(new Error("Duplicated sensorgroup ID"));
            }
            else {
                resolve(group[0]);
            }
        }
        catch(err){
            reject(err);
        }
        return;
   })
};

/**** GET ALL CONFIRMED SENSOR GROUPS : *****/
/**
* Get all confirmed sensor groups
* @async
* @return {Promise.<sensorGroup[]>|Error} confirmed sensor group documents array
* @throws throw error if query fails
*/
sensorGroupSchema.statics.getAllConfirmedSensorGroups = async function getAllConfirmedSensorGroups () {
   return new Promise(async (resolve,reject) => {
        try {
            let groups = await this.find({confirmed: true}).exec();
            resolve(groups);
        }
        catch(err){
            reject(err);
        }
   })
};

/**** GET ALL CONFIRMED SENSOR GROUPS NAMES : *****/
/**
* Get all confirmed sensor groups names
* @async
* @return {Promise.<sensorGroup[]>|Error} confirmed sensor groups names array
* @throws throw error if query fails
*/
sensorGroupSchema.statics.getAllConfirmedSensorGroupsNamesIds = async function getAllConfirmedSensorGroupsNamesIds () {
   return new Promise(async (resolve,reject) => {
        try {
            let groups = await this.find({confirmed: true},{_id:0}).select('groupId name').exec();
            resolve(groups);
        }
        catch(err){
            reject(err);
        }
   })
};

/**** GET ALL UNCONFIRMED SENSOR GROUPS : *****/
/**
* Get all unconfirmed sensor groups
* @async
* @return {Promise.<sensorGroup[]>|Error} unconfirmed sensor group documents array
* @throws throw error if query fails
*/
sensorGroupSchema.statics.getAllUnconfirmedSensorGroups = async function getAllUnconfirmedSensorGroups () {
    // au besoin afiner en renvoyer que les noms ou autre
   return new Promise(async (resolve,reject) => {
        try {
            let groups = await this.find({confirmed: false}).exec();
            resolve(groups);
        }
        catch(err){
            reject(err);
        }
   })
};


/**** GET CONFIRMED SENSOR GROUP BOOLEAN BY ID : *****/
/**
* Get confirmed boolean  by sensor group ID
* @async
* @param {string} groupId
* @return {Promise.<Object>|Error} sensor group document, if doesn't exists "null"
* @throws throw error if query fails
*/
sensorGroupSchema.statics.isGroupConfirmed = async function isGroupConfirmed (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let group = await this.find({groupId: groupId}).select('confirmed').exec() ;
            if (group.length == 0) {
                resolve(null)
            }
            else {
                if (group.length > 1) {
                    reject(new Error("Duplicated sensorgroup ID"));
                }
                resolve(group[0].confirmed);
            }
        }
        catch(err){
            reject(err);
        }
        return;
    })
};


/**** GET UNCONFIRMED SENSORS FROM SENSORS IDS ARRAY : *****/
/**
* Get unconfirmed sensors ids array from sensors ids array for a given groupId, also if new sensors are in the arg array, there are stored
* @async
* @param {string} groupId
* @param {Array.string} sensors
* @return {Promise.<string[]>|Error} unconfirmed sensors ids array
* @throws throw error if query fails or intern error
*/
sensorGroupSchema.statics.isSensorsConfirmed = async function isSensorsConfirmed (groupId,newSensors) {
    // testé avec : arduinouniqueid-t1-t2-rh-rh2 et sensors vide en base
    // arduinouniqueid-t1-t2-rh-rh2 et déjà en base
    // arduinouniqueid-t1-t2-rh-rh2-co2 , co2 nouveau
    // si ensuite : arduinouniqueid-t1-t2-rh renvoi t1,t2,rh et pas autres stockés en base
    return new Promise(async (resolve,reject) => {
        try {
            var exists = false;
            var storedUnconfirmedSensors = [] ;
            var group = await this.find({groupId: groupId}).select('sensors').exec() ;
            if (group.length > 1) {
                throw new Error("Duplicated sensor group id");
            }
            var storedSensors = group[0].sensors;
            // pour chaque sensor vérifier s'il existe, sinon le créer, si oui est-il confirmé ?
            // plus performant de faire un query par sensors ou de chercher dans l'array?
            newSensors.forEach(async elem => {
                exists = false;
                storedSensors.forEach(storElem => {
                    // on trouve le sensor stocké en base correspondant à l'id
                    if (elem === storElem.sensorId) {
                        exists = true;
                        if (storElem.confirmed === false) {
                            // si le sensor n'est pas confirmé on l'ajoute à l'array résultat
                            storedUnconfirmedSensors.push(elem);
                        }//sinon rien, ses données seront acceptées
                    }
                })
                if (exists === false) {
                    // on a pas trouvé le sensorid en base : l'ajouter et le renvoyer comme non confirmé
                    var newSensor = new sensors;
                    newSensor.confirmed = false;
                    newSensor.sensorId = elem;
                    group[0].sensors.push(newSensor);
                    storedUnconfirmedSensors.push(elem);
                }
            });
            await group[0].save();
            resolve(storedUnconfirmedSensors);
        }
        catch(err){
            reject(err);
        }
        return;
    })
};


/***********************************************************************/
/*                      DELETE METHODS  (Delete)                       */
/***********************************************************************/
/**** Delete one sensor group  */
sensorGroupSchema.statics.deleteGroupByGroupId = async function deleteGroupByGroupId (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let groups = await this.find({groupId: groupId}).exec();
            if (groups.length != 1) {
                reject(new Error("Duplicated sensorgroup ID"));
            }
            else {
                await groups[0].deleteOne();
                resolve();
            }
        }
        catch(err){
            reject(err);
        }
    })
};

// DELETE ONE SENSOR
sensorGroupSchema.statics.deleteSensorById = async function deleteSensorById (groupId,sensorId) {
    return new Promise(async (resolve,reject) => {
        try {
            let group = await this.findOne({groupId: groupId}).select('sensors').exec() ;
            group.sensors.forEach(async elem => {
                if (elem.sensorId === sensorId) {
                    await group.sensors.pull(elem._id);
                    await group.save();
                    // Deleting datas dependencies 
                    await storedDatas.deleteDatasDependenciesForSensor(groupId,sensorId);
                    resolve();
                }
            })
            // error message ?
            resolve()
        }
        catch(err){
            console.log(err)
            reject(err);
        }
   })
};

/*****************************************************************/
/*                      ADD / CREATE METHODS                     */
/*****************************************************************/
/**** ADD UNCONFIRMED SENSOR GROUP : *****/
/**
* Store new unconfirmed sensor group
* @async
* @param {string} groupId
* @param {Array.string} sensors
* @return {number|Error} http status (201 created resource success)
* @throws throw error if mongoose save method fails
*/
 sensorGroupSchema.statics.addUnconfirmedSensorGroup = async function addUnconfirmedSensorGroup (groupId,sensorsIds) {
    var group = new sensorGroup;
    group.groupId = groupId;
    group.confirmed = false;
    try {
        for (var i=0; i<sensorsIds.length; i++) {
            let sensor = new sensors;
            sensor.confirmed = false;
            sensor.sensorId = sensorsIds[i];
            group.sensors.push(sensor);
        }
        await group.save();
        return 201;
    }
    catch (err) {
        // do something with error? throw ? nothing?
        throw err;
    }
 };


/**** CHECK SENSORS ARRAY AND ADD IF NEW ONES *****/
/**
* Checking sensors ids array for an unconfirmed given groupId, if new sensors are in the arg array, there are stored
* @async
* @param {string} groupId
* @param {Array.string} sensors
* @return {Promise.<string[]>|Error} new sensors stored
* @throws throw error if query fails or intern error
*/
sensorGroupSchema.statics.checkAndAddIfNewSensors = async function checkAndAddIfNewSensors(groupId,newSensors) {
    return new Promise(async (resolve,reject) => {
        try {
            var exists = false;
            var newStoredSensors = [] ;
            var group = await this.find({groupId: groupId}).select('sensors').exec() ;
            if (group.length > 1) {
                throw new Error("Duplicated sensor group id");
            }
            var storedSensors = group[0].sensors;
            // pour chaque sensor vérifier s'il existe, sinon le créer
            // plus performant de faire un query par sensors ou de chercher dans l'array?
            newSensors.forEach(async elem => {
                exists = false;
                storedSensors.forEach(storElem => {
                    // on trouve le sensor stocké en base correspondant à l'id
                    if (elem === storElem.sensorId) {
                        exists = true;
                    }
                })
                // nouveau sensor détecté, on le store
                if (exists === false) {
                    var newSensor = new sensors;
                    newSensor.confirmed = false;
                    newSensor.sensorId = elem;
                    group[0].sensors.push(newSensor);
                    newStoredSensors.push(elem);
                }
            });
            await group[0].save();
            resolve(newStoredSensors);
        }
        catch(err){
            reject(err);
        }
        return;
    })
};


//compiling model from a schema (sensorGroup et le modèle)
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
var sensors = mongoose.model('sensors',sensorSchema);
var sensorGroup = mongoose.model('sensorGroup',sensorGroupSchema);
module.exports = {sensorGroup};
//module.exports = mongoose.model('SensorGroup',sensorGroupSchema); // remove peut etre added17/04 pour méthode de schema




// First working versions with promises and callbacks

   /* sensorGroupSchema.statics.getTest4 = function (sensorId) {
    return new Promise((resolve,reject) => {
        this
            .find({'sensors._id': sensorId})
            .select('sensors')
            .exec(
                function(err,ans) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        var sensor = ans[0].sensors.id(sensorId);
                        resolve(sensor.dataType);
                    }
                }
            )
    })
  }

  sensorGroupSchema.statics.getTest5 = function(sensorId, callback) {
    var sensor;
    this.find({'sensors._id': sensorId}, function(error, sensorgroup){
        sensor = sensorgroup[0].sensors.id(sensorId)
       // console.log(dataType)
        callback(error,sensor.dataType)
    })
}*/

/******************/
// /* LIVE METHODS   */
// /******************/
// /**** GET SENSOR GROUP SENSORS & TIMEZONE FIELDS BY ID : *****/
// /**
// * Get sensor group timezone & sensors array by ID
// * @async
// * @param {string} groupId
// * @return {Promise.<sensorGroup>|Error} sensor group document (timezone & sensors array field)
// * @throws throw error if query fails
// */
// sensorGroupSchema.statics.getSensorsAndTimezoneByGroupId = async function getSensorsAndTimezoneByGroupId (groupId) {
//     // au besoin afiner en renvoyer que les noms ou autre
//    return new Promise(async (resolve,reject) => {
//         try {
//             let sensors = await this.find({groupId: groupId}).select('sensors timezone').exec() ;
//             if (sensors.length != 1) {
//                 reject(new Error("Duplicated sensorgroup ID"));
//             }
//             else {
//                 resolve(sensors[0])
//             }
//         }
//         catch(err){
//             reject(err);
//         }
//         return;
//    })
// };

// /****************************/
// /*    HISTORY METHODS       */
// /****************************/
// /**** GET SENSOR GROUP TIMEZONE & NAME FIELDS BY ID : *****/
// /**
// * Get sensor group name & timezone by ID
// * @async
// * @param {string} groupId
// * @return {Promise.<sensorGroup>|Error} sensor group document (name timezone)
// * @throws throw error if query fails
// */
// // peut-être à combiner avec la méthode de la page live qui renvoit les infos que pour les sensors et timezone
// sensorGroupSchema.statics.getSensorGroupInfosById = async function getSensorGroupInfosById (groupId) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             let sensors = await this.find({groupId: groupId}).select('name timezone').exec() ;
//             if (sensors.length != 1) {
//                 reject(new Error("Duplicated sensorgroup ID"));
//             }
//             else {
//                 resolve(sensors[0])
//             }
//         }
//         catch(err){
//             reject(err);
//         }
//         return;
//    })
// };

// version before 14.05
// /**** ADD SENSOR GROUP : *****/
// /**
// * Store new sensor group
// * @async
// * @param {string} groupId
// * @param {string} name
// * @param {string} timezone
// * @param {Array.<owner>} owners
// * @return {number|Error} http status (201 created resource success)
// * @throws throw error if mongoose save method fails
// */
// sensorGroupSchema.statics.addSensorGroup = async function addSensorGroup (groupId, name, timezone, owners) {
//     var group = new sensorGroup ;
//     group.groupId = groupId;
//     group.name = name ;
//     group.timezone = timezone;
//     group.owners = owners ;
//     try {
//         await group.save();
//         return 201;
//    }
//    catch(err) {
//     // do something with error , handle here or throw to sensorManager
//     console.log(err);
//     throw err;
//    }
// };

// 
// /**** ADD SENSOR TO SENSOR GROUP : *****/
// /**
// * Store new sensor to a given sensor group
// * @async
// * @param {string} uniqued
// * @param {string} dataType
// * @param {string} name
// * @return {number|Error} http status (201 created resource success)
// * @throws throw error if query or mongoose save method fails
// */
// sensorGroupSchema.statics.addSensor = async function addSensor (groupId,dataType,name) {
//     var sensor = new sensors ;
//     var count = 0 ;
//     sensor.sensorId = groupId+"-"+dataType;
//     sensor.name = name ;
//     sensor.dataType = dataType ;
// // add groupId in other than mongo ObjectId car on peut pas l'overwrite ?
// // todo mécanisme pour save un capteur pour avoir de 2 type différents par exemple :
// // On count le nombre de docs pour ce sensorgroup qui ont ce datatype et store : arduinoid-datatype-(count+1) [garder le 2eme tiret car on utilise des .split]
//     try {
//         let group = await this.findOne({groupId: groupId}).exec();
//         // verify unique datatype, if not : id : groupId-datatype-count
//         group.sensors.forEach(elem => {
//             if (elem.dataType == dataType) {
//                 count++;
//             }
//         });
//         if (count!=0) {
//             sensor.sensorId = sensor.sensorId+"-"+count;
//         }
//         await group.sensors.push(sensor);
//         await group.save();
//         return 201 ;
//     }
//     catch (err) {
//         console.log(err);
//         throw err;
//     }
// };



// /**** GET SENSOR OBJECT BY SENSOR ID : *****/
// /** OLD NOT WORKING
// * Get a given sensor
// * @async
// * @param {string} sensorId
// * @return {Promise} Sensor Object
// * @throws throw error if query fails or internal DB issues
// */
// sensorGroupSchema.statics.getSensorBySensorId = function getSensorBySensorId (sensorId) {
//     // async ?
//   return new Promise((resolve,reject) => {
//       this
//           .find({'sensors._id': sensorId})
//           .select('sensors')
//           .exec(
//               function(err,sensorgroup) {
//                   var sensor;
//                   if (err) {
//                       reject(err);
//                   }
//                   else if (sensorgroup.length!==1) {
//                        //CMt répondre ?
//                       // créer mon erreur en mode sensor group non trouvé
//                       if (sensorgroup.length === 0) {
//                           reject(new Error("Sensor group not found"));
//                       }
//                       else {
//                       //error car +d'1 sensor group trouvé : throw my error ?
//                       reject(new Error("More than 1 sensor group found"));
//                       }
//                   }
//                   else {
//                       // get sensor subdocument
//                       sensor=sensorgroup[0].sensors.id(sensorId);
//                       if(!sensor) {
//                           //right way? peut etre inutile, impossible entrer ici
//                           // error le sensor n'a pas été trouvé
//                           reject(new Error("Sensor not found within the sensor group document"));
//                       }
//                       else {
//                           resolve(sensor);
//                       }
//                   }
//               }
//           )
//   });
// }


// /****************** VERSION BEFORE 14.05 ******************/
// /**** GET DATATYPE BY SENSOR ID : *****/
// /**
// * Get datatype of a given sensor
// * @async
// * @param {string} sensorId
// * @return {string} datatype
// * @throws throw error if query fails or internal DB issues
// */
// // getDataTypeBySensorId -v1
// // todo : surement pas besoin
// sensorGroupSchema.statics.getDataTypeBySensorId = function getDataTypeBySensorId (sensorId) {
//       // async ? use await todo
//       // todo idée : ne plus se servir de cette fonction mais de l'd direct du sensor
//     return new Promise((resolve,reject) => {
//         this
//             .find({'sensors.sensorId': sensorId})
//             .select('sensors')
//             .exec(
//                 function(err,sensorgroup) {
//                     var sensor;
//                     if (err) {
//                         reject(err);
//                     }
//                     else if (sensorgroup.length!==1) {
//                          //CMt répondre ?
//                         // créer mon erreur en mode sensor group non trouvé
//                         if (sensorgroup.length === 0) {
//                             reject(new Error("Sensor group not found"));
//                         }
//                         else {
//                         //error car +d'1 sensor group trouvé : throw my error ?
//                         reject(new Error("More than 1 sensor group found"));
//                         }
//                     }
//                     else {
//                         // get sensor subdocument
//                         //works if sensor id manipuler dans l'appli est l'id de mongo (changed 30/04)
//                         sensor=sensorgroup[0].sensors.id(sensorId);
//                         if(!sensor) {
//                             //right way? peut etre inutile, impossible entrer ici
//                             // error le sensor n'a pas été trouvé
//                             reject(new Error("Sensor not found within the sensor group document"));
//                         }
//                         else {
//                             // send response with the datatype of the sensor
//                             resolve(sensor.dataType);
//                         }
//                     }
//                 }
//             )
//     });
//   }



// /**** GET DATATYPE & TIMEZONE BY SENSOR ID : *****/
// /**
// * Get datatype of a given sensor
// * @async
// * @param {string} sensorId
// * @return {Promise} Object with timezone & dataType
// * @throws throw error if query fails or internal DB issues
// */
// sensorGroupSchema.statics.getDataTypeAndTimezoneBySensorId = function getDataTypeAndTimezoneBySensorId (sensorId) {
//     // async ?
//   return new Promise((resolve,reject) => {
//       this
//           .find({'sensors._id': sensorId})
//           .select('timezone sensors')
//           .exec(
//               function(err,sensorgroup) {
//                   var sensor;
//                   if (err) {
//                       reject(err);
//                   }
//                   else if (sensorgroup.length!==1) {
//                        //CMt répondre ?
//                       // créer mon erreur en mode sensor group non trouvé
//                       if (sensorgroup.length === 0) {
//                           reject(new Error("Sensor group not found"));
//                       }
//                       else {
//                       //error car +d'1 sensor group trouvé : throw my error ?
//                       reject(new Error("More than 1 sensor group found"));
//                       }
//                   }
//                   else {
//                       // get sensor subdocument
//                       sensor=sensorgroup[0].sensors.id(sensorId);
//                       if(!sensor) {
//                           //right way? peut etre inutile, impossible entrer ici
//                           // error le sensor n'a pas été trouvé
//                           reject(new Error("Sensor not found within the sensor group document"));
//                       }
//                       else {
//                           // send response with the datatype of the sensor
//                           let res = {timezone: sensorgroup[0].timezone, dataType : sensor.dataType}
//                           resolve(res);
//                       }
//                   }
//               }
//           )
//   });
// }