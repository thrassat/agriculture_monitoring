const mongoose = require( 'mongoose'); 
    timestamps = require('mongoose-timestamp');
// ajout required quasi partout, des min/max ? todo 

const storedDatasSchema = new mongoose.Schema( {
    date: {
        type: Date, 
        required: true
    }, //timestamp? remplacé par le plug-in ou doublé par sécu ? 
    sensorId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup', //_id du sensor embed en vrai, todo, meme ref un sub document de sensorsgroups 
        required: true
    }, //string 
    // supp  type: {type: String, required: true}, oui ajouter, pas sur voir note reu6 potentiellement avec l'ID du sensor on verra quel schema il a et on reconnait le type et commen traiteer 
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
// to check: voir si mieux d'ajouter juste manuellement un field de création

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('StoredData',storedDataSchema) ;