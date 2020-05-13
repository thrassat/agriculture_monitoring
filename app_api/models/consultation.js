var mongoose = require( 'mongoose'); 

// ANCIEN DOCUMENT

var storedDataSchema = new mongoose.Schema( {
    date: {type: Date, required: true}, //timestamp?
    sensorId: {type: mongoose.SchemaTypes.ObjectId, required: true}, //string 
  // supp  type: {type: String, required: true},
    value: {type: mongoose.SchemaTypes.Mixed, required: true}
     /* on utilise polymorphic pattern , avec le field "type" 
    on saura quel type de données on a dans value grâce au type*/
    /* idée d'avoir un schéma flexible ici, value changera de type selon le type de donnés*/
    /* potentielle utilisation d'attribute pattern */
});

var sensorSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true} ,
        //UUID
    name: String,
    createdAt: Date,
    lastAccessAt: Date,
    dataType: String
});

var sensorGroupSchema = new mongoose.Schema( {
   //ID ? 
   name: String,
   //geographic location? todo? 
   owner: mongoose.SchemaTypes.ObjectId, //ref to owner in user collections 
   // avant comme ça voir comment ça marche mongoose.SchemaTypes.ObjectId]
   sensors: [sensorSchema] //[0,3,6]
});


// todo : validation and mongoose.model...
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String, // lowercase + regexp (match) ? 
    createdAt: Date,
    lastAcessAt: Date,
    role: String,
    accessTo: [mongoose.SchemaTypes.ObjectId] //array of sensorGroup ID's
});

/* données transmises par capteur ? */
// EMBEDDED OR FOREIGN KEY ? 

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('SensorGroup',sensorGroupSchema);
mongoose.model('StoredData',storedDataSchema) ;