const mongoose = require('mongoose'); 
        passportLocalMongoose = require('passport-local-mongoose'); 
        Schema = mongoose.Schema; 
        timestamps = require('mongoose-timestamp');

/*************************************************/
/*                  SUBDOCUMENTS                 */
/*************************************************/
/**************************************/
/*           AccessTo Schema          */
/**************************************/
//todo use & test
const accessToSchema= new mongoose.Schema({
    accessTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup',
    },
},//{ _id: false }
);
/**************************************/
/*           group Schema             */
/**************************************/
//todo use & test
const groupSchema= new mongoose.Schema({
    group: {
        type: mongoose.SchemaTypes.ObjectId, // todo use name ? ENUM ? 
        ref: 'UserGroup',
    },
},{ _id: false });

/*************************************************/
/*                 MAIN DOCUMENT                 */
/*                  USER SCHEMA                  */
/*************************************************/
const UserSchema = new Schema ({
    username: String, 
    password : String,
    role: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    group: [groupSchema],
    accessTo: [accessToSchema], 
    isAdmin: [accessToSchema] //new mais surement nécessaire 
    
        //array of sensorGroup ID's
    //manage: sensorgroupids pour lequel l'utilisateur est administrateur ?  
})
/**************************************/
/*               PLUGINS              */
/**************************************/
UserSchema.plugin(passportLocalMongoose); // add password salt & hash
UserSchema.plugin(timestamps);  // add created at & lastupdate at

//https://github.com/saintedlama/passport-local-mongoose#api-documentation
// https://www.npmjs.com/package/passport-local-mongoose 

UserSchema.statics.getAllUsersNameRole = async function getAllUsersNameRole () {
    return new Promise(async (resolve,reject) => {
        try {
            let users = await this.find().select('username role').exec();
            resolve(users);
        }
        catch (err) {
            reject(err);
        }
    })
};


// todo better way to use mongoose schema ? 
//ex 1 : (mherman) module.exports = mongoose.model('users', UserSchema);
//ex2 : (sitepoitn) const Users = mongoose.model('users', UserSchema); 
const user = mongoose.model('user',UserSchema);   
module.exports = {user};

