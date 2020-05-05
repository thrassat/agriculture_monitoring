const mongoose = require( 'mongoose'); 
timestamps = require('mongoose-timestamp');

 const storedDatasSchema = new mongoose.Schema( {
    date: {
        type: Date, 
        required: true
    }, //timestamp? remplacé par le plug-in ou doublé par sécu ? 
    /*sensorId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup', //_id du sensor embed, ref sensors    en vrai, todo, meme ref un sub document de sensorsgroups 
        required: true
    }, //string */ 
    // Changement de conception : on ne force pas être un objectid ce field là, comme ça on peut gérer 
    // le field sensor ID comme on l'entend direct avec son object id 
    // arduinoid-datatype(-num)
    sensorId: {
        type: String,
        required: true,
        // todo regexp
    },
    // supprimé  type: {type: String, required: true},oui ajouter, pas sur voir note reu6 potentiellement avec l'ID du sensor on verra quel schema il a et on reconnait le type et commen traiteer 
    value: {
        type: mongoose.SchemaTypes.Mixed,
        required: true,     
    },
     /* on utilise polymorphic pattern , avec le field "type" 
    on saura quel type de données on a dans value grâce au type*/
    /* idée d'avoir un schéma flexible ici, value changera de type selon le type de donnés*/
    /* potentielle utilisation d'attribute pattern */
}, //{collection: todo}
);
storedDatasSchema.plugin(timestamps); // add created at and last update at
// todo check: voir si mieux d'ajouter juste manuellement un field de création


/******************/
/* LIVE METHODS   */
/******************/
storedDatasSchema.statics.getLastDataBySensorId = async function getLastDataBySensorId (sensorId) {
    return new Promise(async (resolve,reject) => {
        try {
            let dataPacket  = await this.findOne({sensorId: sensorId}).sort({date: -1}).exec();
            resolve(dataPacket); 
        }
        catch(err) {
            reject(err);    
        }
    })
}; 

/*********************/
/*  HISTORY METHODS  */
/*********************/
storedDatasSchema.statics.getDatasFromTo = async function getDatasFromTo (sensorId,from,to) {
    return new Promise(async (resolve,reject) => {
        try {
            let datas = await this.find({sensorId: sensorId}).find({ date: {$gte: new Date(from), $lte: new Date(to)}}).exec(); 
            // works on Mongo compass { "date": {$gt: new Date('2017'),$lt: new Date('2021')} }
            resolve(datas); 
        }
        catch (err) {
            reject(err)
        }
    })
}


/***************************/
/* DATA RECEIVER METHODS   */
/***************************/

// return 201 : http status code for created resource
// Or throw error 
storedDatasSchema.statics.registerIntData = async function registerIntData (date,sensorId,value) {
   var storedData = new storedDatas ; 
    storedData.date=date; 
   // SensorId n'est pas un 'objectId' mongoose
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

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
const storedDatas = mongoose.model('storedDatas',storedDatasSchema);   
module.exports = {storedDatas};