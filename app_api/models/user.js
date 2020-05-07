const mongoose = require('mongoose'); 
        passportLocalMongoose = require('passport-local-mongoose'); 
        Schema = mongoose.Schema; 
        timestamps = require('mongoose-timestamp');

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
const UserSchema = new Schema ({
    username: String, 
    password : String,
    role: {
        type: String,
    },
    group: [groupSchema],
    accessTo: [accessToSchema] //array of sensorGroup ID's

})

UserSchema.plugin(passportLocalMongoose); 
UserSchema.plugin(timestamps); 
//https://github.com/saintedlama/passport-local-mongoose#api-documentation
// https://www.npmjs.com/package/passport-local-mongoose 

// "_id" : ObjectId("5e602713f917353c5858eb85"),
// 	"username" : "admin",
// 	"password" : "admin",
// 	"email" : "admin@admin.ca",
// 	"role" : "admin",
// 	"group" : [
// 		{
// 			"group" : ObjectId("5e5fd52c80710513dc9c88c9")
// 		}
// 	],
// 	"accessTo" : [ ],
// 	"updatedAt" : ISODate("2020-03-04T22:09:23.415Z"),
// 	"createdAt" : ISODate("2020-03-04T22:09:23.415Z"),
// 	"__v" : 0

// todo better way to use mongoose schema ? 
//ex 1 : (mherman) module.exports = mongoose.model('users', UserSchema);
//ex2 : (sitepoitn) const Users = mongoose.model('users', UserSchema); 
const user = mongoose.model('user',UserSchema);   
module.exports = {user};

