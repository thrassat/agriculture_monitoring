const mongoose = require( 'mongoose'); 
    timestamps = require('mongoose-timestamp');

// todo : validation and mongoose.model...
//Todo : USER GROUP!

const accessToSchema= new mongoose.Schema({
    accessTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup',
    },
},//{ _id: false }
);

const groupSchema= new mongoose.Schema({
    group: {
        type: mongoose.SchemaTypes.ObjectId, // todo use name ? ENUM ? 
        ref: 'UserGroup',
    },
},{ _id: false });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    // password: {
    //     //TODO p356 getting mean, add method setpassword & validatepwd
    //     type: String,
    //     required: true,
    // },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    hash: String,
    salt: String,
        // lowercase + regexp (match) ? 
   /* createdAt: Date,
    lastAcessAt: Date, autom avec timestamp, voir si update & acess similar*/ 
    role: {
        type: String,
    },
    group: [groupSchema],
    accessTo: [accessToSchema] //array of sensorGroup ID's
},
{collection: 'users'}
);
userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pdkdf2(password,this.salt,1000,64,'sha-512').toString('hex'); 
//todo try more iterations than 1000? 
}
userSchema.methods.validPassword = function (password) {
    var hash = crypto.pdkf2Sync(password,this.salt,1000,64,'sha-512').toString('hex');
    return this.hash === hash;
}

userSchema.plugin(timestamps);
/* données transmises par capteur ? */
// EMBEDDED OR FOREIGN KEY ? 

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
mongoose.model('User',userSchema); 