const mongoose = require('mongoose'); 
    Schema = mongoose.Schema; 
    timestamps = require('mongoose-timestamp');
    
const {user} = require('./user') ; 

/*************************************************/
/*                 MAIN DOCUMENT                 */
/*               USER GROUP SCHEMA               */
/*************************************************/
const userGroupSchema = new Schema({
    // Nom du groupe d'utilisateurs
    name: {
        type: String,
        unique: true,
        required: true,
    },
    // Groupe(s) de capteurs (sensorGroup) auxquels l'ensemble des utilisateurs appartenant a ce groupe d'utilisateur a accès : consultation des données temps réel et historique  
    // array de sensorGroup.groupId 
    accessTo : [String],
    // Groupe(s) de capteurs (sensorGroup) pour lesquels l'ensemble des utilisateurs appartenant a ce groupe d'utilisateur est administrateur : création de compte "user" liés, confirmation/paramétrage de capteurs etc...  
    // array de sensorGroup.groupId
    isAdmin : [String]
});

/**************************************/
/*               PLUGINS              */
/**************************************/
userGroupSchema.plugin(timestamps); // add createdAt & lastUpdateAt to all userGroup documents

/**************************************/
/*               ERRORS               */
/**************************************/
// Message d'erreur customisé dans le cas d'une valeur déjà existante (potential todo : point de vue sécurité : s'assurer que ça ne renvoi pas trop d'informations)
//https://mongoosejs.com/docs/middleware.html
userGroupSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        var field = error.errmsg.split("index:")[1].split("dup key")[0].split("_")[0];
        var value= error.errmsg.match(/\".*\"/);
        if (field.trim()==='name') {
            next(new Error("Nom de groupe d'utilisateurs déjà existant"))
        }
        else {
            next(new Error('La valeur : '+value+ ' est déjà existante pour le champ "'+field.trim()+'" - Veuillez réessayer'));
        }
    } else {
      next();
    }
  });

/****************************************************************************/
/*               ON DELETE, DELETE DEPENCIES (cascade delete)               */
/****************************************************************************/
// fonction appelée lorsqu'un user group est supprimé (appel de la méthode DeleteOne() après suppression d'un groupe utilisateur depuis l'application)
userGroupSchema.pre('deleteOne', { document: true },async function(next) {
    try {
        await user.deleteUsersDependenciesForUserGroup(this.name);
    }
    catch (err) {
        throw err;
        // morgan ? How to handle 
    }
});

/************************************************************************************************************************/
/*                                      STATIC USER GROUP METHODS                                                       */
/************************************************************************************************************************/
/*************************************************************************/
/*                      GETTERS METHODS  (READ)                          */
/*************************************************************************/
// Get all usergroups 
// only name field 
userGroupSchema.statics.getAllUserGroups = async function getAllUserGroups () {
    return new Promise(async (resolve,reject) =>{
        try {
            let userGroups = await this.find({},{_id:0}).select('name').exec();
            resolve(userGroups);
        }
        catch (err) {
            reject(err);
        }
    })
};

// Get all usergroups
// all fields 
userGroupSchema.statics.getAllUserGroupsFields = async function getAllUserGroupsFields () {
    return new Promise(async (resolve,reject) =>{
        try {
            let userGroups = await this.find({},{_id:0}).exec();
            resolve(userGroups);
        }
        catch (err) {
            reject(err);
        }
    })
};

//Get one user group document by groupName  
userGroupSchema.statics.getUserGroup = async function getUserGroup (groupName) {
    return new Promise(async (resolve,reject) =>{
        try {
            let group = await this.findOne({name : groupName}).exec(); 
            resolve(group);
        }
        catch (err) {
            reject(err);
        }
    })
};

// GET ALL USER GROUP "ADMINS" OF A GIVEN SENSOR GROUPID 
userGroupSchema.statics.getGroupAdmin = async function getGroupAdmin (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let storedGroupAdmin = [];
            let groups = await this.find().exec();
            for(var i=0; i<groups.length;i++) {
                let index = groups[i].isAdmin.indexOf(groupId); 
                if (index>-1) {
                    storedGroupAdmin.push(groups[i].name);
                }
            }
            resolve(storedGroupAdmin)
        }
        catch(err) {
            reject(err);    
        }
    })
}


// GET ALL USER GROUPS WHICH HAS ACCESS TO A GIVEN SENSOR GROUPID 
userGroupSchema.statics.getGroupAccess = async function getGroupAccess (groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let storedGroupAccess = [];
            let groups = await this.find().exec();
            for(var i=0; i<groups.length;i++) {
                let index = groups[i].accessTo.indexOf(groupId); 
                if (index>-1) {
                    storedGroupAccess.push(groups[i].name);
                }
            }
            resolve(storedGroupAccess)
        }
        catch(err) {
            reject(err);    
        }
    })
}
/******************************************/
/*       BEGIN ACCESS CONTROL :           */
/******************************************/
// Arguments : un nom d'user group, un sensor group id 
// return true si jamais cet user group à accès a ce sensorgroup
userGroupSchema.statics.isBelongingUserGroupAccess = async function isBelongingUserGroupAccess (userGroups,groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            var accessFound = false ; 
            // loop through user groups
            for (var i=0 ; i<userGroups.length;i++) {
                let currentUserGroup = await this.findOne({name: userGroups[i]}).select('accessTo').exec() 
                if (currentUserGroup){
                    let index = currentUserGroup.accessTo.indexOf(groupId);
                    if (index > -1) {
                        // Un groupe utilisateur fournit l'accès au groupe de capteur  
                        accessFound = true;
                    }
                }
                //else { } Normalement impossible : bug dans la db : potentiellement log ? 
            }
            resolve(accessFound);  
        }
        catch(err){
            reject(err);
        }   
    })
};
// Arguments : un nom d'user group, un sensor group id 
// return true si jamais cet user group est administrateur de ce sensorgroup
userGroupSchema.statics.isBelongingUserGroupAdmin = async function isBelongingUserGroupAdmin (userGroups,groupId) {
    return new Promise(async (resolve,reject) => {
        try {
            var accessFound = false ; 
            // loop through user groups
            for (var i=0 ; i<userGroups.length;i++) {
                let currentUserGroup = await this.findOne({name: userGroups[i]}).select('isAdmin').exec() 
                if (currentUserGroup){
                    let index = currentUserGroup.isAdmin.indexOf(groupId);
                    if (index > -1) {
                        // Un groupe utilisateur fournit l'accès au groupe de capteur  
                        accessFound = true;
                    }
                }
                //else { } Normalement impossible : bug dans la db : potentiellement log ? 
            } 
            resolve(accessFound);  
        }
        catch(err){
            reject(err);
        }   
    })
};
/******************************************/
/*         END ACCESS CONTROL :           */
/******************************************/

/***********************************************************************/
/*                      DELETE METHODS  (Delete)                       */
/***********************************************************************/
userGroupSchema.statics.deleteGroupByName = async function deleteGroupByName(groupName) {
    // au besoin afiner en renvoyer que les noms ou autre 
   return new Promise(async (resolve,reject) => {
        try {
            let group = await this.findOne({name: groupName}).exec();   
            await group.deleteOne(); 
            resolve();  
        }
        catch(err){
            reject(err);
        }   
    })
};


//SUPPRESS ADMIN FOR ALL GROUPS (for a given sensorgroupID )
userGroupSchema.statics.suppressAdminAllGroups = async function suppressAdminAllGroups (sensorGroupId) {
    return new Promise(async (resolve,reject) => {
        try {
        
            let groups = await this.find().exec();
            for (var i=0;i<groups.length;i++) {
                let index = groups[i].isAdmin.indexOf(sensorGroupId) ; 
                if (index>-1) {
                    groups[i].isAdmin.splice(index,1);
                    await groups[i].save();
                }
            } 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}
//SUPPRESS ACCESS FOR ALL GROUPS (for a given sensorgroupID )
userGroupSchema.statics.suppressAccessAllGroups = async function suppressAccessAllGroups (sensorGroupId) {
    return new Promise(async (resolve,reject) => {
        try {
        
            let groups = await this.find().exec();
            for (var i=0;i<groups.length;i++) {
                let index = groups[i].accessTo.indexOf(sensorGroupId) ; 
                if (index>-1) {
                    groups[i].accessTo.splice(index,1);
                    await groups[i].save();
                }
            } 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

// SUPPRESS ADMIN FOR A GIVEN USERGROUP AND SENSORGROUP ID 
userGroupSchema.statics.suppressAdminFromGroup = async function suppressAdminFromGroup (groupName, sensorGroupId) {
    return new Promise(async (resolve,reject) => {
        try { 
            let group = await this.findOne({name: groupName}).exec();
            let index = group.isAdmin.indexOf(sensorGroupId) ; 
            if (index>-1) {
                group.isAdmin.splice(index,1);
                await group.save() ;
            }
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

// SUPPRESS ACCESS FOR A GIVEN USERGROUP AND SENSORGROUP ID 
userGroupSchema.statics.suppressAccessFromGroup = async function suppressAccessFromGroup (groupName, sensorGroupId) {
    return new Promise(async (resolve,reject) => {
        try { 
            let group = await this.findOne({name: groupName}).exec();
            let index = group.accessTo.indexOf(sensorGroupId) ; 
            if (index>-1) {
                group.accessTo.splice(index,1);
                await group.save() ;
            }
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

/*****************************************************************/
/*                      ADD / CREATE METHODS                     */
/*****************************************************************/
//ADD NEW USER GROUP
userGroupSchema.statics.addNewGroup = async function addNewGroup (group) {
    return new Promise(async (resolve,reject) =>{
        try {
            await userGroup.create({
                name : group.groupName, 
                accessTo: group.groupAccess,
                isAdmin: group.groupAdmin,
                }); 
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })
};

// ADD ADMIN RIGHT FOR A SENSORGROUP TO AN USERGROUP (groupname, sensorgroupId)
userGroupSchema.statics.addAdminToGroup = async function addAdminToGroup (groupName, sensorGroupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let group = await this.findOne({name: groupName}).exec();
            if (group.isAdmin === undefined) {
                group.isAdmin = []
            }
            group.isAdmin.push(sensorGroupId); 
            await group.save() ; 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}

// ADD ACCESS RIGHT FOR A SENSORGROUP TO AN USERGROUP (groupname, sensorgroupId)
userGroupSchema.statics.addAccessToGroup = async function addAccessToGroup (groupName, sensorGroupId) {
    return new Promise(async (resolve,reject) => {
        try {
            let group = await this.findOne({name: groupName}).exec();
            if (group.accessTo === undefined) {
                group.accessTo = []
            }
            group.accessTo.push(sensorGroupId); 
            await group.save() ; 
            resolve();
        }
        catch(err) {
            reject(err);    
        }
    })
}


/***************************************************************/
/*                          UPDATE METHODS                     */
/***************************************************************/
 
userGroupSchema.statics.updateGroup = async function updateGroup (groupName, newGroup) {
    return new Promise(async (resolve,reject) =>{
     try {
         let group = await this.findOne({name : groupName}).exec(); 
     
         group.accessTo = newGroup.groupAccess; 
         group.isAdmin = newGroup.groupAdmin;
         await group.save()
         resolve(group);
     }
     catch (err) {
         reject(err);
     }
 })
}


//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model 
const userGroup = mongoose.model('userGroup',userGroupSchema);
module.exports = {userGroup}; 


/* TODO je pense tokeep , peut etre pas besoin de redéfinir,
ou pas gérer accès/droits à d'autres choses
const accessToSchema= new mongoose.Schema({
    accessTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'SensorGroup',
    },
});
*/

// Update group access 
// userGroupSchema.statics.updateUserGroupAccessByName =  async function updateUserGroupAccessByName (groupName, sensorGroupId) {
//     return new Promise(async (resolve,reject) =>{
//         try {
//             let group = await this.findOne({name : groupName}).exec(); 
//             let index = group.accessTo.indexOf(sensorGroupId) ; 
//             if (index === -1) {
//                  // l'ID du groupe de sensors paramétré n'est pas dans les access de l'usergroup
//                 // on l'ajoute 
//                 group.accessTo.push(sensorGroupId) ; 
//                 await group.save();
//             }
//             resolve();
//         }
//         catch (err) {
//             reject(err);
//         }
//     })
// }

// Update group admin 
// userGroupSchema.statics.updateUserGroupAdminByName =  async function updateUserGroupAdminByName (groupName, sensorGroupId) {
//     return new Promise(async (resolve,reject) =>{
//         try {
//             let group = await this.findOne({name : groupName}).exec(); 
//             let index = group.isAdmin.indexOf(sensorGroupId) ; 
//             if (index === -1) {
//                  // l'ID du groupe de sensors paramétré n'est pas dans les access de l'usergroup
//                 // on l'ajoute 
//                 group.isAdmin.push(sensorGroupId) ; 
//                 await group.save();
//             }
//             resolve();
//         }
//         catch (err) {
//             reject(err);
//         }
//     })
// }