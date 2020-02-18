var mongoose = require( 'mongoose'); 

//Séparer les datas par module , par capteur ? ?
//possibilité de subdocument !

var consultationSchema = new mongoose.Schema( { 
/*possible to add default value, require field, min/max values
geographics coords, index (puissance query)*/
    temp: Number,
    rh: Number,
    co2: Number,
    "timestamp": Date
});
//coords: {type: [Number], index: '2dsphere'}

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('Consultation',consultationSchema); 