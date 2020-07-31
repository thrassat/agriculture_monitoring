const mongoose = require( 'mongoose'); 
      //timestamps = require('mongoose-timestamp');
const crypto = require('crypto');
/**************************************/
/*          TOKEN SCHEMA              */
/**************************************/
// Utilisé pour générer une url unique et avec une date d'expiration pour la création de compte et le renouvellement de mot de passe 

const tokenSchema = new Schema ({
    token: {
        type: String,
        required: true  
    },
    expiration: {
        //from https://stackoverflow.com/questions/14597241/setting-expiry-time-for-a-collection-in-mongodb-using-mongoose
        type: Date,
        required: true,
        expires: 86400, //24hours
        default: Date.now  
    },
    //user lié
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'valid email is required',
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    }
});


/**************************************/
/*               ERRORS               */
/**************************************/
tokenSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        var field = error.errmsg.split("index:")[1].split("dup key")[0].split("_")[0];
        // works var value = error.errmsg.split("index:")[1].split("dup key")[1].split("\"")[1].split("\"")[0]; // verif
        var value= error.errmsg.match(/\".*\"/);
        //let [i, field, value] = error.errmsg.match(/index:\s([a-z]+).*{\s?\:\s?"([a-z]+)"/i);
        // todo reu : s'assurer que c'est correct de mettre le champ comme ça ou donner ce type d'erreur 
        if (field.trim()==='email') {
            next(new Error("Un lien a déjà été envoyé à cette adresse mail"))
        }
        else {
            next(new Error('La valeur : '+value+ ' est déjà existante pour le champ "'+field.trim()+'" - Veuillez réessayer'));
        }
    } else {
      next();
    }
  });

// tokenSchema.post('remove', function(error,doc,next) {
//     idée : rajouter un champ : used et s'il reste false (on a pas confirmé le compte alors quand le token expire on supprime le compte user associé)
//     D'après ce post : https://stackoverflow.com/questions/41430949/executing-a-script-when-mongoose-timer-expires
//     pas possible
//      A faire manuellement depuis l'application avec un super admin 
//      todo documenter ça  
    // Je peux rapide ajouter un field : confirmé truefalse dans le modèle user et quand il set son password on met à true
    // comme ça dans la gestion des comptes le superadmin pourrait les voir facilement pour les supprimer au cas ou   
// });

  
/**************************************/
/*               METHODS              */
/**************************************/
tokenSchema.statics.createToken = async function createToken (email) {
    return new Promise(async (resolve,reject) => {
        try {
            // Function inspired from https://stackoverflow.com/questions/8838624/node-js-send-email-on-registration?noredirect=1&lq=1 
            var tokenString; 
            var tokenObject = new token; 
            // require('crypto').randomBytes(32, function(ex, buf) {
            //     tokenString = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
            // });
            // console.log(tokenString)
            tokenString = crypto.randomBytes(32).toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
            //console.log(tok)
            tokenObject.token = tokenString ;
            tokenObject.email = email;   
            await tokenObject.save();
            resolve(tokenString);
        }
        catch (err) {
            reject(err);
        }
    })
};


tokenSchema.statics.getTokenObject = async function getTokenObject (token) {
    return new Promise(async (resolve,reject) => {
        try {
            let tokenObject = await this.findOne({token:token}).exec();
            resolve(tokenObject);
        }
        catch (err) {
            reject(err);
        }
    })
}; 

tokenSchema.statics.deleteToken = async function deleteToken (email) {
    return new Promise(async (resolve,reject) => {
        try {
            let tokenObject = await this.findOne({email: email}).exec();
            await tokenObject.deleteOne();
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })
}; 

//compiling model from a schema
// Arg1 : name of model, 2: schema to use,
// 3:optional mongoDB collection name, si vide : par défault pluriel et sans maj du nom model : consultations
const token = mongoose.model('token',tokenSchema);   
module.exports = {token};