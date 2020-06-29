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
    // populate method : 
    // un document mongo remplacera le champ au final pas ce que l'on cherche 
    // Linking : référence vers un document d'une autre collection 
    // via son objectId : pertinent ici ? 
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
    //accessToTmp: [String],
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
UserSchema.statics.addUser = async function addUser (username, mail, role, groups, access, admin) {
    return new Promise(async (resolve,reject) => {
        try {
            let uz = new user;
            uz.username = username; 
            // password ? 
            uz.email = mail; 
            uz.role = role; 
            if (groups) {
                uz.group = groups;
            }
            else { uz.group = [];}
            uz.accessTo = access;
            if (role === 'admin') {
                uz.isAdmin = admin; 
            }
            else { uz.isAdmin = [];}
            await user.save(); 
        }
        catch(err) {
            reject(err); 
        }
    })
};


UserSchema.statics.addUserObject = async function addUserObject (uz) {
    return new Promise(async (resolve,reject) => {
        try {
            let newUser = new user;
            newUser = uz;
            console.log(newUser)
            console.log(Array.isArray(newUser.accessTo))
            var admin = new Object();
            var access = new Object();
            
            admin.accessTo = [];
            access.accessTo = [];
            admin.accessTo.push('5ef21b6f8df5451c475be03d'); // works! try to delete groups and see if reference still here ? 
            access.accessTo.push('5ef21b6f8df5451c475be03d');
         //  access.accessTo.push('5ef114ebe4f3463570bd795d'); // two objects : failed ": Cast to ObjectID failed for value "[ '5ef21b6f8df5451c475be03d', '5ef114ebe4f3463570bd795d' ]""
            //access.accessTo.push('uniqueid6');  // dont work avec SensorGroup.groupId
            //access.accessTo= uz.accessTo; //cast to objectId failed for value "[ 'ydokoceokoqp2' ]" 
            await user.create({
                username: 'test',
                email: 'test@test.ca',
                role: 'superadmin',
               // accessToTmp: ['ydokoceokoqp2', 'okospoksopdock'], //works,
               accessTo : access, 
               isAdmin: admin,
            }); 
            resolve();
            
        }
        catch(err) {
            reject(err); 
        }
    })
};


// todo better way to use mongoose schema ? 
//ex 1 : (mherman) module.exports = mongoose.model('users', UserSchema);
//ex2 : (sitepoitn) const Users = mongoose.model('users', UserSchema); 
const user = mongoose.model('user',UserSchema);   
module.exports = {user};

