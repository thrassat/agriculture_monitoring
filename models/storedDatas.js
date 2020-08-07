const mongoose = require( 'mongoose'); 
timestamps = require('mongoose-timestamp');

/*************************************************/
/*                 MAIN DOCUMENT                 */
/*              STORED DATAS SCHEMA              */
/*************************************************/
 const storedDatasSchema = new mongoose.Schema( {
    // correspond au temps de mesure capturé par l'Arduino et associé à l'envoi de cette donnée
    date: {
        type: Date, 
        required: true
    }, //timestamp? remplacé par le plug-in? Pour l'instant doublé par sécurité, peuvent différer 
    // ID du groupe de capteur (Arduino) d'où provient la donnée
    groupId: {
        type: String, 
        required: true,
        // potential todo regexp?
    },
    // ID du capteur d'où provient la donnée 
    sensorId: {
        type: String,
        required: true,
        // potential todo regexp?
    },
    // valeur de la donnée : du mongoose type mixed mais pour l'instant on gère le type javascript number seulement
    value: {
        type: mongoose.SchemaTypes.Mixed,
        required: true,     
    },
}, {collection: 'storeddatas'}
);

/**************************************/
/*               PLUGINS              */
/**************************************/
storedDatasSchema.plugin(timestamps); // add created at and last update at
// potential todo check: voir si mieux d'ajouter juste manuellement un field de création


/*************************************************************************************************************************/
/*                                      STATIC STORED DATAS METHODS                                                      */  
/*************************************************************************************************************************/
/**
 * @typedef storedData
 * @property {Date} date Timestamp
 * @property {string} sensorid Stored data of that sensor id
 * @property {any} value Valeur de la grandeur
 */

/*************************************************************************/
/*                      GETTERS METHODS  (READ)                          */
/*************************************************************************/
/**** GET LAST DATA BY SENSOR ID: *****/
/**
* Get last stored datas for a given sensor
* @async
* @param {string} groupId
* @param {string} sensorId 
* @return {Promise.<storedData>|Error} dataPacket 
* @throws throw error if query fails
*/
storedDatasSchema.statics.getLastDataByIds = async function getLastDataByIds (groupId,sensorId) {
    return new Promise(async (resolve,reject) => {
        try {
            let dataPacket  = await this.findOne({groupId: groupId, sensorId: sensorId}).sort({date: -1}).exec();
            resolve(dataPacket); 
        }
        catch(err) {
            reject(err);    
        }
    })
}; 

/**** GET DATAS FROM..TO BY SENSOR & GROUP ID : *****/
/**
* Get all stored datas for a given sensor between two dates
* @async
* @param {string} sensorId 
* @param {Date} from
* @param {Date} to
* @return {Promise.<storedData[]>|Error} datas
* @throws throw error if query fails
*/
storedDatasSchema.statics.getDatasFromTo = async function getDatasFromTo (groupId,sensorId,from,to) {
    return new Promise(async (resolve,reject) => {
        try {
            let datas = await this.find({groupId: groupId, sensorId: sensorId}).find({ date: {$gte: from, $lte: to}}).sort({date: 1}).exec(); 
            // https://www.w3schools.com/js/js_dates.asp 
            resolve(datas); 
        }
        catch (err) {
            reject(err)
        }
    })
}; 

/**** GET ALL DATAS BY SENSOR ID : *****/
/**
* Get all stored datas for a given sensor 
* @async
* @param {string} sensorId 
* @return {Promise.<storedData[]>|Error} datas
* @throws throw error if query fails
*/
storedDatasSchema.statics.getAllDatas = async function getAllDatas (groupId,sensorId) {
    return new Promise(async (resolve,reject) => {
        try {
            let datas = await this.find({groupId: groupId, sensorId: sensorId}).select('value date').sort({date: 1}).exec(); 
            // https://www.w3schools.com/js/js_dates.asp 
            resolve(datas); 
        }
        catch (err) {
            reject(err)
        }
    })
}; 

/***********************************************************************/
/*                      DELETE METHODS  (Delete)                       */
/***********************************************************************/
// Delete related sensorGroup datas
storedDatasSchema.statics.deleteDatasDependenciesForGroupId = async function deleteDatasDependenciesForGroupId (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            await this.deleteMany({groupId: groupId}).exec();
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })
}
// Delete related datas for a sensor
// todo tests 
storedDatasSchema.statics.deleteDatasDependenciesForSensor = async function deleteDatasDependenciesForSensor (groupId,sensorId) {
    return new Promise(async (resolve,reject) => {
        try {
            await this.deleteMany({groupId: groupId,sensorId: sensorId}).exec();
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })

}

/*****************************************************************/
/*                      ADD / CREATE METHODS                     */
/*****************************************************************/
/**** REGISTER A INTEGER DATAPACKET : *****/
/**
* Store received number data   
* @async
* @param {Date} date timestamp of that data 
* @param {string} groupId 
* @param {string} sensorId 
* @param {number} value
* @return {number|Error} http status (201 created resource success)
* @throws throw error if mongoose save method fails
*/  

// potential todo retourner une promise resolve du result de save ? en soit retourne rien JSON save mais on peut créer notre promise response 
storedDatasSchema.statics.registerIntData = async function registerIntData (date,groupId,sensorId,value) {
    var storedData = new storedDatas ; 
     storedData.date=date; 
    // SensorId n'est pas un 'objectId' mongoose
    storedData.groupId = groupId; 
    storedData.sensorId=sensorId;
    storedData.value=value;    
    try { 
         await storedData.save(); 
         return 201; 
    }
    catch(err) {
     // do something with error , handle here or throw to dataReceiver
     console.log(err); 
     throw err; 
     //possible "style "
     /*if (err instanceof HttpError && err.response.status == 404) {
         // loop continues after the alert
         alert("No such user, please reenter.");
       } else {
         // unknown error, rethrow
         throw err;
       }*/
    }
 }
// 



//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
const storedDatas = mongoose.model('storedDatas',storedDatasSchema);   
module.exports = {storedDatas};


/**** GET LAST DATA BY SENSOR ID OLD: *****/
// /**
// * Get last stored datas for a given sensor
// * @async
// * @param {string} sensorId 
// * @return {Promise.<storedData>|Error} dataPacket 
// * @throws throw error if query fails
// */
// storedDatasSchema.statics.getLastDataBySensorId = async function getLastDataBySensorId (sensorId) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             let dataPacket  = await this.findOne({sensorId: sensorId}).sort({date: -1}).exec();
//             resolve(dataPacket); 
//         }
//         catch(err) {
//             reject(err);    
//         }
//     })
// }; 

/**** GET ALL DATAS BY SENSOR ID OLD: *****/
// /**
// * Get all stored datas for a given sensor 
// * @async
// * @param {string} sensorId 
// * @return {Promise.<storedData[]>|Error} datas
// * @throws throw error if query fails
// */
// storedDatasSchema.statics.getAllDatas1 = async function getAllDatas1 (sensorId) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             let datas = await this.find({sensorId: sensorId}).sort({date: 1}).exec(); 
//             // works on Mongo compass { "date": {$gt: new Date('2017'),$lt: new Date('2021')} }
//             // https://www.w3schools.com/js/js_dates.asp 
//             // formating datas to send ici ? Ou dans le controller api (timezone etc.. needed), faire un objet de 2 array, date et data qui correspondent
//             resolve(datas); 
//         }
//         catch (err) {
//             reject(err)
//         }
//     })
// }; 

/**** REGISTER A DATAPACKET OLD VERSION : *****/
// /**
// * Store received number data   
// * @async
// * @param {Date} date timestamp of that data 
// * @param {string} sensorId 
// * @param {number} value
// * @return {number|Error} http status (201 created resource success)
// * @throws throw error if mongoose save method fails
// */  

// // todo retourner une promise resolve du result de save ? en soit retourne rien JSON save mais on peut créer notre promise response 
// storedDatasSchema.statics.registerIntDataOld = async function registerIntDataOld (date,sensorId,value) {
//     try { 
//         var storedData = new storedDatas ; 
//         storedData.date=date; 
//         // SensorId n'est pas un 'objectId' mongoose
//         storedData.sensorId=sensorId;
//         storedData.value=value;    
   
//         await storedData.save(); 
//         return 201; 
//    }
//    catch(err) {
//     // do something with error , handle here or throw to dataReceiver
//     console.log(err); 
//     throw err; 
//     //possible "style "
//     /*if (err instanceof HttpError && err.response.status == 404) {
//         // loop continues after the alert
//         alert("No such user, please reenter.");
//       } else {
//         // unknown error, rethrow
//         throw err;
//       }*/
//    }
// }


