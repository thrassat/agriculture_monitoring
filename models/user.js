const mongoose = require('mongoose'); 
const {userGroup} = require('./userGroup');
        passportLocalMongoose = require('passport-local-mongoose'); 
        Schema = mongoose.Schema; 
        timestamps = require('mongoose-timestamp');
       
/*************************************************/
/*                 MAIN DOCUMENT                 */
/*                  USER SCHEMA                  */
/*************************************************/
const UserSchema = new Schema ({
   // role (droits) du compte : "user" / "admin" / "superadmin"
    role: {
        type: String,
    },
    // e-mail du compte lié 
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    
    // [[ si le rôle du compte est "superadmin" : les 3 champs suivant ne sont pas nécessaires ( a déjà tous les droits) ]] 

    // groupe(s) d'utilisateurs auxquels l'utilisateur peut appartenir 
    // array de groupUser.name
    group: [String], 
    // Groupe(s) de capteurs (sensorGroup) auxquels le compte (role : "user"&"admin") a accès : consultation des données temps réel et historique  
    // array de sensorGroup.groupId 
    accessTo: [String], 
    // Groupe(s) de capteurs (sensorGroup) pour lesquels le compte (role : "admin") est administrateur : création de compte "user" liés, confirmation/paramétrage de capteurs etc...  
    // array de sensorGroup.groupId
    isAdmin: [String]

    //first conception
    //accessTo: [accessToSchema], //probleme casting et pas utile car pas de cascade delete possible 
   // group: [groupSchema],
   //isAdmin: [accessToSchema],
});

/**************************************/
/*               PLUGINS              */
/**************************************/
UserSchema.plugin(passportLocalMongoose); // add password salt & hash fields to UserSchema
UserSchema.plugin(timestamps);  // add created at & lastupdate at 

//https://github.com/saintedlama/passport-local-mongoose#api-documentation
// https://www.npmjs.com/package/passport-local-mongoose 

/**************************************/
/*               ERRORS               */
/**************************************/
 // Message d'erreur customisé dans le cas d'une valeur déjà existante (potential todo : point de vue sécurité : s'assurer que ça ne renvoi pas trop d'informations)
//https://mongoosejs.com/docs/middleware.html
UserSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        var field = error.errmsg.split("index:")[1].split("dup key")[0].split("_")[0];
        var value= error.errmsg.match(/\".*\"/);
        if (field.trim()==='username') {
            next(new Error("Ce nom d'utilisateur existe déjà"))
        }
        else if (field.trim() ==='email') {
            next(new Error("Adresse e-mail déjà existante"))
        }
        else {
            next(new Error('La valeur : '+value+ ' est déjà existante pour le champ "'+field.trim()+'" - Veuillez réessayer'));
        }
    } else {
      next();
    }
  });

/*****************************************************************************************************************/
/*                                      STATIC USER METHODS                                                      */
/*****************************************************************************************************************/

/*************************************************************************/
/*                      GETTERS METHODS  (READ)                          */
/*************************************************************************/
// Get all users : username & role
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

// Get user document by username 
UserSchema.statics.getUserByUsername = async function getUserByUsername (username) {
    return new Promise(async (resolve,reject) => {
        try {
            let user = await this.findOne({username: username}).exec();
            resolve(user);
        }
        catch (err) {
            reject(err);
        }
    })
}; 

// Get user document by email 
UserSchema.statics.getUserByEmail = async function getUserByEmail (email) {
    return new Promise(async (resolve,reject) => {
        try {
            let user = await this.findOne({email: email}).exec();
            resolve(user);
        }
        catch (err) {
            reject(err);
        }
    })
}; 

// get all users except superAdmin
UserSchema.statics.getAllUsers = async function getAllUsers () {
    return new Promise(async (resolve,reject) => {
        try {
            let users = await this.find({ $or: [ { role: 'user' }, { role: 'admin'} ] } ).select('username accessTo isAdmin').exec();
            resolve(users);
        }
        catch (err) {
            reject(err);
        }
    })
}

// get all admins 
UserSchema.statics.getAllAdmins = async function getAllAdmins () {
    return new Promise(async (resolve,reject) => {
        try {
            let admins = await this.find({role: 'admin'}).select('username accessTo isAdmin').exec();
            resolve(admins);
        }
        catch (err) {
            reject(err);
        }
    })
}

// GET USERS (user & admin) WITH ACCESS FOR A GIVEN SENSORGROUP 
UserSchema.statics.getUsersWithAccess = async function getUsersWithAccess (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let storedUserWithAccess = [];
            let users = await this.find({ $or: [ { role: 'user' }, { role: 'admin'} ] } ).exec();
            for(var i=0; i<users.length;i++) {
                let index = users[i].accessTo.indexOf(groupId); 
                if (index>-1) {
                    storedUserWithAccess.push(users[i].username);
                }
            }
            resolve(storedUserWithAccess)
        }
        catch(err) {
            reject(err);    
        }
    })
}


// GET ADMINS OF A GIVEN GROUPID 
UserSchema.statics.getAdmins = async function getAdmins (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let storedAdmins = [];
            let admins = await this.find({ role: 'admin'}).exec();
            for(var i=0; i<admins.length;i++) {
                let index = admins[i].isAdmin.indexOf(groupId); 
                if (index>-1) {
                    storedAdmins.push(admins[i].username);
                }
            }
            resolve(storedAdmins)
        }
        catch(err) {
            reject(err);    
        }
    })
}

/******************************************/
/*      BEGIN ACCESS CONTROL :            */
/******************************************/
// COMPTE USER ADMIN : ACCESS TO A GIVEN SENSOR GROUP ?  
// args: mail utilisateur & ID d'un sensorgroup
// return : boolean if the user has access to this sensor group
UserSchema.statics.hasAccessTo = async function hasAccessTo (userMail,groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let hasAccess = false; 
            //find user accessarray
            let user = await this.findOne({email:userMail}).select('group accessTo').exec(); 
            // find if groupId is the acess array
            let index = user.accessTo.indexOf(groupId); 
            if (index > -1) {
                hasAccess = true; 
            }
            else { 
                let userGroupAcess = await userGroup.isBelongingUserGroupAccess(user.group,groupId); 
                if (userGroupAcess) {
                    hasAccess = true; 
                }
            }
            resolve(hasAccess);
        }
        catch (err) {
            reject(err);
        }
    })
}

// if a given user id , is admin of a given sensorgroup 
UserSchema.statics.isAdminOf = async function isAdminOf (userMail,groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let isAdmin = false; 
            //find user accessarray
            let user = await this.findOne({email:userMail}).select('group isAdmin').exec(); 
            // find if groupId is the acess array
            let index = user.isAdmin.indexOf(groupId); 
            if (index > -1) {
                isAdmin = true; 
            }
            else { 
                let userGroupAdmin = await userGroup.isBelongingUserGroupAdmin(user.group,groupId); 
                if (userGroupAdmin) {
                    isAdmin = true; 
                }
            }
            resolve(isAdmin);
        }
        catch (err) {
            reject(err);
        }
    })
}

//arg : email utilisateur & un array de sensorgroup ; 
// return :  array pour lesquels l'utilisateur est administrateur  
UserSchema.statics.keepOnlyAdminGroups = async function keepOnlyAdminGroups (userMail,sensorGroupArray) {
    return new Promise(async (resolve,reject) => {
        try {
            let isAdminSensorGroups = []
            let user = await this.findOne({email:userMail}).select('group isAdmin').exec(); 
            // find if groupId is the acess array
            for (var i=0;i<sensorGroupArray.length;i++) {
                let index = user.isAdmin.indexOf(sensorGroupArray[i].groupId);
                if (index > -1) {
                    isAdminSensorGroups.push(sensorGroupArray[i]); 
                }
                else {
                    // check si l'utilisateur appartient à un usergroup étant administrateur de ce sensorgroup
                    let userGroupAdmin = await userGroup.isBelongingUserGroupAdmin(user.group,sensorGroupArray[i].groupId) ; 
                    if (userGroupAdmin) {
                        isAdminSensorGroups.push(sensorGroupArray[i]); 
                    }
                }
            }
            resolve(isAdminSensorGroups);
        }
        catch (err) {
            reject(err);
        }
    })
}
/*****************************************/
/*         END ACCESS CONTROL :          */
/*****************************************/
/***********************************************************************/
/*                      DELETE METHODS  (Delete)                       */
/***********************************************************************/
// SUPPRESS ACCESS RIGHTS FOR A GIVEN USER, SENSORGROUP (user,groupId)
UserSchema.statics.suppressAccess = async function suppressAccess (userName, groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            // first find 
            let user = await this.findOne({username: userName}).exec();
            let index = user.accessTo.indexOf(groupId) ; 
            if (index>-1) {
                user.accessTo.splice(index,1);
                await user.save() ;
            }
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

// SUPPRESS ACCESS FOR ALL USERS FOR A GIVEN SENSORGROUP(admin & user) (groupId)
UserSchema.statics.suppressAccessAllUsers = async function suppressAccessAllUsers (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
        
            let users = await this.find({ $or: [ { role: 'user' }, { role: 'admin'} ] } ).exec();
            for (var i=0;i<users.length;i++) {
                let index = users[i].accessTo.indexOf(groupId) ; 
                if (index>-1) {
                    users[i].accessTo.splice(index,1);
                    await users[i].save();
                }
            } 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}


// SUPPRESS ADMIN FOR A GIVEN USER AND GROUP ID 
UserSchema.statics.suppressAdmin = async function suppressAdmin (userName, groupId) {
    return new Promise(async (resolve,reject) => {
        try { 
            let admin = await this.findOne({username: userName}).exec();
            let index = admin.isAdmin.indexOf(groupId) ; 
            if (index>-1) {
                admin.isAdmin.splice(index,1);
                await admin.save() ;
            }
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}
//SUPPRESS ADMIN FOR ALL ADMINS (for a given groupID)
UserSchema.statics.suppressAdminAllAdmin = async function suppressAdminAllAdmin (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
        
            let admins = await this.find({ role: 'admin'}).exec();
            for (var i=0;i<admins.length;i++) {
                let index = admins[i].isAdmin.indexOf(groupId) ; 
                if (index>-1) {
                    admins[i].isAdmin.splice(index,1);
                    await admins[i].save();
                }
            } 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

// REMOVE ACCOUNT (document) by e-mail 
UserSchema.statics.deleteUserByEmail = async function deleteUserByEmail(email) {
    return new Promise(async (resolve,reject) => {
        try {
            // first find 
            var user = await this.findOne({email: email}).exec();
            if (user.role === 'superadmin') {
                let allSuperAdmin = await this.find({role: 'superadmin'}).exec()
                if (allSuperAdmin.length < 2) {
                    reject(new Error("Impossible de supprimer le dernier compte super administrateur"));
                } 
                else {
                    await user.deleteOne();
                }
            }
            else {
                await user.deleteOne();
            }
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
};
/// DELETE DEPENDENCIES WHEN SENSOR GROUP IS REMOVED 
UserSchema.statics.deleteUsersDependenciesForGroupId = async function deleteUsersDependenciesForGroupId (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let users = await this.find().select('role accessTo isAdmin').exec();
            for(var i=0;i<users.length;i++) {
                if (users[i].role !== "superadmin") {
                // supprime bien, mais vérfiier si jamais trouve pas le group id si supprime pas un truc random                  
                    if (users[i].accessTo.indexOf(groupId) !== -1) {
                        users[i].accessTo.splice (users[i].accessTo.indexOf(groupId), 1);
                    }
                    if (users[i].role === 'admin') {
                        if (users[i].accessTo.indexOf(groupId) !== -1) {
                            users[i].accessTo.splice (users[i].accessTo.indexOf(groupId), 1);
                        }
                        if (users[i].isAdmin.indexOf(groupId) !== -1) {
                            users[i].isAdmin.splice (users[i].isAdmin.indexOf(groupId), 1);
                        }
                    }
                    users[i].save()
                }
            }
            resolve();
                
        }
        catch (err) {
            reject(err);
        }
    })
}; 


// DELETE DEPENDENCIES WHEN USERGROUP IS REMOVED 
UserSchema.statics.deleteUsersDependenciesForUserGroup = async function deleteUsersDependenciesForUserGroup (groupName) {
    return new Promise(async (resolve,reject) => {
        try {
            let users = await this.find().select('group').exec();
            for(var i=0;i<users.length;i++) {
                
                if (users[i].group.indexOf(groupName) !== -1) {
                    users[i].group.splice (users[i].group.indexOf(groupName), 1);
                }
                users[i].save()
            }
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })
}; 

/*****************************************************************/
/*                      ADD / CREATE METHODS                     */
/*****************************************************************/
// add new user to DB
UserSchema.statics.addUserObject = async function addUserObject (uz) {
    return new Promise(async (resolve,reject) => {
        try {
            // todo ? Opti ça selon les différents roles 
            await user.create({
                username : uz.username, 
                email: uz.email,
                role: uz.role,
                group: uz.group,
                accessTo: uz.accessTo,
                isAdmin: uz.isAdmin
            }); 
            resolve();
        }
        catch(err) {
            reject(err); 
        }
    })
};


// ADD ACCESS RIGHTS (user,groupId)
UserSchema.statics.addAccess = async function addAccess (userName, groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            // first find 
            let user = await this.findOne({username: userName}).exec();
           // console.log(user.accessTo)
           console.log(user)
           if (user.accessTo === undefined) {
               user.accessTo = []
           }
            user.accessTo.push(groupId); 
            await user.save() ; 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

// ADD ADMIN RIGHTS (user,groupId)
UserSchema.statics.addAdmin = async function addAdmin (userName, groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            // first find 
            let user = await this.findOne({username: userName}).exec();
           if (user.isAdmin === undefined) {
               user.isAdmin = []
           }
            user.isAdmin.push(groupId); 
            await user.save() ; 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}
// 

/***************************************************************/
/*                          UPDATE METHODS                     */
/***************************************************************/
//UPDATE USER (PWD USERNAME)
UserSchema.statics.updateUser = async function updateUser (uz) {
    return new Promise(async (resolve,reject) => {
        try {
            // first find 
            var newUser = await this.findOne({email: uz.email}).exec();
            newUser.username = uz.username; 
           
            await newUser.setPassword(uz.password) // passport local mongoose
            await newUser.save();
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

// FIRST CONCEPTION : 
// /*************************************************/
// /*                  SUBDOCUMENTS                 */
// /*************************************************/
// /**************************************/
// /*           AccessTo Schema          */
// /**************************************/
// //todo use & test
// const accessToSchema= new mongoose.Schema({
//     // populate method : 
//     // un document mongo remplacera le champ au final pas ce que l'on cherche 
//     // Linking : référence vers un document d'une autre collection 
//     // via son objectId : pertinent ici ? 
//     accessTo: {
//         type: mongoose.SchemaTypes.Mixed,
//         ref: 'SensorGroup',
//     },
// },//{ _id: false }
// );
// /**************************************/
// /*           group Schema             */
// /**************************************/
// //todo use & test
// const groupSchema= new mongoose.Schema({
//     group: {
//         type: mongoose.SchemaTypes.Mixed, // todo use name ? ENUM ? 
//         ref: 'UserGroup',
//     },
// },{ _id: false });


// //reset Pwd 
// UserSchema.statics.deletePwd = async function deletePwd (email) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             let user = await this.findOne({email: email}).select('hash salt').exec();
//             user.hash = '';
//             user.salt = ''; 
//             resolve();
//         }
//         catch (err) {
//             reject(err);
//         }
//     })

// }

// UserSchema.statics.addUser = async function addUser (username, mail, role, groups, access, admin) {
    //     return new Promise(async (resolve,reject) => {
    //         try {
    //             let uz = new user;
    //             uz.username = username; 
    //             // password ? 
    //             uz.email = mail; 
    //             uz.role = role; 
    //             if (groups) {
    //                 uz.group = groups;
    //             }
    //             else { uz.group = [];}
    //             uz.accessTo = access;
    //             if (role === 'admin') {
    //                 uz.isAdmin = admin; 
    //             }
    //             else { uz.isAdmin = [];}
    //             await user.save(); 
    //         }
    //         catch(err) {
    //             reject(err); 
    //         }
    //     })
    // };

   // UserSchema.statics.getUserGroupsAccessArray = async function getUserGroupsAccessArray (groups) {
        //     return new Promise(async (resolve,reject) => {
        //         try {
        //             for(var i=0; i<groups.length; i++) {
        //                 var groupAccess = await userGroup.getAccess(groups[i]) ; 
                        
        //             }
        //             resolve();
        //         }
        //         catch (err) {
        //             reject(err);
        //         }
        //     })
        // };
        
        // UPDATE USER ACCESSTO FOR ONLY ONE ACCESS NO
// UserSchema.statics.updateUserOneAccessByUsername = async function updateUserOneAccessByUsername (username, groupId) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             // first find 
//             let userObj = await this.findOne({username: username}).exec();
//             userObj.accessTo = [] ;
//             userObj.push(groupId); 
//             await userObj.save(); 
//             resolve();
//         }
//         catch(err) {
//             reject(err);    
//         }
//     })
// }


// UPDATE USER ACCESTO FIELD 
// UserSchema.statics.updateUserAccessByUsername = async function updateUserAccessByUsername (username,groupId) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             // first find 
//             let userObj = await this.findOne({username: username}).exec();
//             let index = userObj.accessTo.indexOf(groupId); 
//             //si le groupId n'y est pas : ajouter
//             if (index === -1) {
//                 // l'ID du groupe de sensors paramétré n'est pas dans les access de l'user
//                 // on l'ajoute 
//                 userObj.accessTo.push(groupId); 
//                 await userObj.save();
//             } 
//             resolve();
//         }
//         catch(err) {
//             reject(err);    
//         }
//     })
// };

// // UPDATE USER ISADMIN FIELD
// UserSchema.statics.updateUserAdminByUsername = async function updateUserAdminByUsername (username,groupId) {
//     return new Promise(async (resolve,reject) => {
//         try {
//             // first find 
//             let userObj = await this.findOne({username: username}).exec();
//             let index = userObj.isAdmin.indexOf(groupId); 
//             if (index === -1) {
//                 // l'ID du groupe de sensors paramétré n'est pas dans les access de l'user
//                 // on l'ajoute 
//                 userObj.isAdmin.push(groupId); 
//                 await userObj.save();
//             } 
//             resolve();
//         }
//         catch(err) {
//             reject(err);    
//         }
//     })
// };


// Needed when a sensorgroup is being removed 
// UserSchema.statics.getAllUsersDependenciesFields = async function  getAllUsersDependenciesFields ()  {
//     return new Promise(async (resolve,reject) => {
//         try {
//             let users = await this.find().select('accessTo isAdmin').exec();
//             resolve(users);

//         }
//         catch (err) {
//             reject(err);
//         }
//     })
// };

//USER_V0 password handle 
//userSchema.methods.setPassword = function (password) {
    //     this.salt = crypto.randomBytes(16).toString('hex');
    //     this.hash = crypto.pdkdf2(password,this.salt,1000,64,'sha-512').toString('hex'); 
    // //todo try more iterations than 1000? 
    // }
    // userSchema.methods.validPassword = function (password) {
    //     var hash = crypto.pdkf2Sync(password,this.salt,1000,64,'sha-512').toString('hex');
    //     return this.hash === hash;
    // }