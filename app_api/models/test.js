var mongoose = require( 'mongoose'); 

//Séparer les datas par module , par capteur ? ?
//possibilité de subdocument !

var sensorSchema = new mongoose.Schema( { 
/*possible to add default value, require field, min/max values
geographics coords, index (puissance query)*/
    name: String,
    uuid: String,
        // potentiellement l'enregistrer comme _id du document et sous le format BSON BinData 
        // cf. 'The _id field' https://docs.mongodb.com/manual/core/document/ 
    createdAt: Date, //DATETIME ? 
    lastAcessAt: Date,
    dataType: String //considère 
    
});
//coords: {type: [Number], index: '2dsphere'}



var storedDataSchema = new mongoose.Schema( {
    date: Date, //timestamp?
    type: String,
    value: Any 
    // TODO , number pour l'instant, array potentiel? 
    // fréquence aux 10 minutes? 
    // binaire si camera


});

var sensorGroupSchema = new mongoose.Schema( {
    name: String
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    createdAt: Date,
    lastAcessAt: Date,
    role: String
});





/* données transmises par capteur ? */
// EMBEDDED OR FOREIGN KEY ? 

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('Sensor',sensorSchema); 