const mongoose = require( 'mongoose'); 
    timestamps = require('mongoose-timestamp');

// todo : validation and mongoose.model...
//Todo : USER GROUP!

/* TODO je pense tokeep , peut etre pas besoin de redéfinir,
ou pas gérer accès/droits à d'autres choses
const accessToSchema= new mongoose.Schema({
    accessTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup',
    },
});
*/
const userGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    // lowercase + regexp (match) ? 
    //accessTo: [accessToSchema],
   /* createdAt: Date,
    lastAcessAt: Date, autom avec timestamp, voir si update & acess similar*/ 
    //accessTo: [mongoose.SchemaTypes.ObjectId] //array of sensorGroup ID's
    // ou potentielle autre restriction? 
});

userGroupSchema.plugin(timestamps);
/* données transmises par capteur ? */
// EMBEDDED OR FOREIGN KEY ? 

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model 
mongoose.model('UserGroup',userGroupSchema); 