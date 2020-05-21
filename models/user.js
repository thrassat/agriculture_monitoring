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
    group: [groupSchema],
    accessTo: [accessToSchema] //array of sensorGroup ID's
})
/**************************************/
/*               PLUGINS              */
/**************************************/
UserSchema.plugin(passportLocalMongoose); // add password salt & hash
UserSchema.plugin(timestamps);  // add created at & lastupdate at

//https://github.com/saintedlama/passport-local-mongoose#api-documentation
// https://www.npmjs.com/package/passport-local-mongoose 


// todo better way to use mongoose schema ? 
//ex 1 : (mherman) module.exports = mongoose.model('users', UserSchema);
//ex2 : (sitepoitn) const Users = mongoose.model('users', UserSchema); 
const user = mongoose.model('user',UserSchema);   
module.exports = {user};

