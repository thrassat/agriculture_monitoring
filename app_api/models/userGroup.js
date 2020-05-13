const mongoose = require( 'mongoose'); 
    timestamps = require('mongoose-timestamp');

// NOT USED FOR THE MOMENT, todo 

/* TODO je pense tokeep , peut etre pas besoin de redéfinir,
ou pas gérer accès/droits à d'autres choses
const accessToSchema= new mongoose.Schema({
    accessTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup',
    },
});
*/

/*************************************************/
/*                 MAIN DOCUMENT                 */
/*               USER GROUP SCHEMA               */
/*************************************************/
const userGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    // lowercase + regexp (match) ? 
    //accessTo: [accessToSchema],
   
});

/**************************************/
/*               PLUGINS              */
/**************************************/
userGroupSchema.plugin(timestamps);


//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model 
mongoose.model('UserGroup',userGroupSchema); 