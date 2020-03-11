var mongoose = require( 'mongoose'); 
// ajout required quasi partout, des min/max ? todo 

var storedDataSchema = new mongoose.Schema( {
    date: Date, //timestamp?
    sensorId: mongoose.SchemaTypes.ObjectId, //string 
    type: String,
    value: mongoose.SchemaTypes.Mixed
});

var sensorSchema = new mongoose.Schema({
    _id: String, // UUID
    name: String,
    createdAt: Date,
    lastAccessAt: Date,
    dataType: String
});

var sensorGroupSchema = new mongoose.Schema( {
   //ID ? 
   name: String,
   //geographic location?
   owner: mongoose.SchemaTypes.ObjectId, //ref to owner in user collections
   sensors: [sensorSchema] //[0,3,6]
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    createdAt: Date,
    lastAcessAt: Date,
    role: String,
    accessTo: [mongoose.SchemaTypes.ObjectId] //array of sensorGroup ID's
});


//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('SensorGroup',sensorGroupSchema,sensorgroups);
mongoose.model('StoredData',storedDataSchema,storeddatas) ;