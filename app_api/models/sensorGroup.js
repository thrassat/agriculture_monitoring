const mongoose = require( 'mongoose'); 
      timestamps = require('mongoose-timestamp');

const sensorSchema = new mongoose.Schema({
    sensorid: { // on overwrite pas le ObjectID de MongoDB, mais on crée notre propre "id field"
    // format : sensorgrouid-datatype 
        type: String,
        trim: true,
        required: true,
        unique: true,
        index: true, //added after storing datas tests
        // todo refaire avec index true
        sparse: true, //alow null values when registered and next filled with unique values 
    },
    name: {
        type: String,
        trim: true,
        required: true, // maybe not required ? 
    },
   /* createdAt: Date,
    lastAccessAt: Date, ajouté automatiquement via timestamp plug-in*/
    dataType: { // convention actuelle [temp,rh,co2]
        type: String,
        trim: true,
        required: true,
        //regexp ? verify convention type (temp,rh,co2...)
    },
});

const ownerSchema= new mongoose.Schema({
    // todo non fonctionnel actuellement 
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',//ref to owner in user collections (populate method)
    },
});

var sensorGroupSchema = new mongoose.Schema({
  // uniqueid : 128bits envoyé par l'Arduino. 
  // on overwrite pas le mongo objectid
   uniqueid: {
       type: String,
       trim: true, 
       required: true,
       index: true
       // regexp ? 
   },
   name: {
       type: String,
       trim: true,
       required: true, 
       index: true,
   },
   timezone: {
       type: String,
       required: true,
       trim: true
       //todo regexp
   },
   //geographic location? 
   owners: [ownerSchema], // todo add owner correctement 
   sensors: [sensorSchema] //[0,3,6] [min,average,max]
}, 
{collection: 'sensorgroups'}
);

sensorSchema.plugin(timestamps); 
sensorGroupSchema.plugin(timestamps);

/*************************************************************************************************************************/
/*                                      STATIC SENSOR GROUP METHODS                                                      */  
/*************************************************************************************************************************/

/******************/
/* INDEX METHODS  */
/******************/
sensorGroupSchema.statics.getAllSensorGroups = async function () {
    // au besoin afiner en renvoyer que les noms ou autre 
   return new Promise(async (resolve,reject) => {
        try {
            //groups = await this.find().exec() ; 
            resolve(await this.find().exec());
        }
        catch(err){
            reject(err);
        }
   })
};

/******************/
/* LIVE METHODS   */
/******************/
sensorGroupSchema.statics.getSensorsByGroupId = async function (groupId) {
    // au besoin afiner en renvoyer que les noms ou autre 
   return new Promise(async (resolve,reject) => {
        try { 
            let sensors = await this.find({uniqueid: groupId}).select('sensors timezone').exec() ;
            if (sensors.length != 1) {
                reject(new Error("Duplicated sensorgroup ID"));
            }
            else {
                resolve(sensors[0])
            }
        }
        catch(err){
            reject(err);
        }
        return; 
   })
};

/****************************/
/* SENSOR MANAGER METHODS   */
/****************************/
sensorGroupSchema.statics.addSensorGroup = async function (uniqueid, name, timezone, owners) {
    var group = new sensorGroup ; 
    group.uniqueid = uniqueid; 
    group.name = name ; 
    group.timezone = timezone; 
    group.owners = owners ; 
    try { 
        await group.save(); 
        return 201; 
   }
   catch(err) {
    // do something with error , handle here or throw to sensorManager
    console.log(err); 
    throw err; 
   }
};

sensorGroupSchema.statics.addSensor = async function (groupid,name,dataType) {
    var sensor = new sensors ; 
    sensor.sensorid = groupid+"-"+dataType; 
    sensor.name = name ; 
    sensor.dataType = dataType ; 
// add uniqueid in other than mongo ObjectId car on peut pas l'overwrite ? 
// todo mécanisme pour save un capteur pour avoir de 2 type différents par exemple : 
// On count le nombre de docs pour ce sensorgroup qui ont ce datatype et store : arduinoid-datatype-(count+1) [garder le 2eme tiret car on utilise des .split]
    try {
        let group = await this.findOne({uniqueid: groupid}).exec(); 
        await group.sensors.push(sensor); 
        await group.save();
        return 201 ; 
    }
    catch (err) {
        console.log(err); 
        throw err; 
    }
}; 

/**************************/
/* DATAS RECEIVER METHODS */
/**************************/

// getDataTypeBySensorId -v1
sensorGroupSchema.statics.getDataTypeBySensorId = function (sensorId) {
      // async ? use await todo 
      // todo idée : ne plus se servir de cette fonction mais de l'uniqueid direct du sensor
    return new Promise((resolve,reject) => {
        this
            .find({'sensors.sensorid': sensorId})
            .select('sensors') 
            .exec(
                function(err,sensorgroup) {
                    var sensor;
                    if (err) {
                        reject(err); 
                    }
                    else if (sensorgroup.length!==1) {
                         //CMt répondre ? 
                        // créer mon erreur en mode sensor group non trouvé
                        if (sensorgroup.length === 0) {
                            reject(new Error("Sensor group not found"));
                        }
                        else {
                        //error car +d'1 sensor group trouvé : throw my error ? 
                        reject(new Error("More than 1 sensor group found"));
                        }
                    }   
                    else {
                        // get sensor subdocument
                        //works if sensor id manipuler dans l'appli est l'id de mongo (changed 30/04)
                        sensor=sensorgroup[0].sensors.id(sensorId);
                        if(!sensor) {
                            //right way? peut etre inutile, impossible entrer ici
                            // error le sensor n'a pas été trouvé 
                            reject(new Error("Sensor not found within the sensor group document"));
                        }
                        else {
                            // send response with the datatype of the sensor
                            resolve(sensor.dataType);
                        }
                    }
                }
            )
    });
  }

sensorGroupSchema.statics.getDataTypeAndTimezoneBySensorId = function (sensorId) {
    // async ? 
  return new Promise((resolve,reject) => {
      this
          .find({'sensors._id': sensorId})
          .select('timezone sensors') 
          .exec(
              function(err,sensorgroup) {
                  var sensor;
                  if (err) {
                      reject(err); 
                  }
                  else if (sensorgroup.length!==1) {
                       //CMt répondre ? 
                      // créer mon erreur en mode sensor group non trouvé
                      if (sensorgroup.length === 0) {
                          reject(new Error("Sensor group not found"));
                      }
                      else {
                      //error car +d'1 sensor group trouvé : throw my error ? 
                      reject(new Error("More than 1 sensor group found"));
                      }
                  }   
                  else {
                      // get sensor subdocument
                      sensor=sensorgroup[0].sensors.id(sensorId);
                      if(!sensor) {
                          //right way? peut etre inutile, impossible entrer ici
                          // error le sensor n'a pas été trouvé 
                          reject(new Error("Sensor not found within the sensor group document"));
                      }
                      else {
                          // send response with the datatype of the sensor
                          let res = {timezone: sensorgroup[0].timezone, dataType : sensor.dataType}
                          resolve(res);
                      }
                  }
              }
          )
  });
}

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


  //compiling model from a schema (sensorGroup et le modèle)
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
const sensors = mongoose.model('sensors',sensorSchema);
const sensorGroup = mongoose.model('sensorGroup',sensorGroupSchema);   
module.exports = {sensorGroup};
//module.exports = mongoose.model('SensorGroup',sensorGroupSchema); // remove peut etre added17/04 pour méthode de schema 
