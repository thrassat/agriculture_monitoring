const mongoose = require( 'mongoose'); 
      timestamps = require('mongoose-timestamp');
// ajout required quasi partout, des min/max ? todo 

const sensorSchema = new mongoose.Schema({
    _id: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
        //UUID
    name: {
        type: String,
        trim: true,
        required: true,
    },
   /* createdAt: Date,
    lastAccessAt: Date, ajouté automatiquement via timestamp plug-in*/
    dataType: {
        type: String,
        trim: true,
        required: true,
    },
});


const ownerSchema= new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',//ref to owner in user collections (populate method)
    },
});

const sensorGroupSchema = new mongoose.Schema({
   //ID ? Ref vers un autre schema ?? 
   name: {
       type: String,
       trim: true,
       required: true, 
       index: true,
   },
   //geographic location? todo
   owners: [ownerSchema],
   sensors: [sensorSchema] //[0,3,6]
}, 
{collection: 'sensorgroups'}
);

sensorSchema.plugin(timestamps); 

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('SensorGroup',sensorGroupSchema);