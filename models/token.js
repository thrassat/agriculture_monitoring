const mongoose = require( 'mongoose'); 
const crypto = require('crypto');
/**************************************/
/*          TOKEN SCHEMA              */
/**************************************/
// Utilisé pour générer une url unique et avec une date d'expiration pour la création de compte et le renouvellement de mot de passe 

const tokenSchema = new Schema ({
    // random string 
    token: {
        type: String,
        required: true  
    },
    // utilisation de mongoose pour une auto expiration du document après 24h
    expiration: {
        //from https://stackoverflow.com/questions/14597241/setting-expiry-time-for-a-collection-in-mongodb-using-mongoose
        type: Date,
        required: true,
        expires: 86400, //24hours
        default: Date.now  
    },
    //user lié (via l'e-mail)
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
  
/*******************************************************************************************************************/
/*                                      STATIC TOKENS METHODS                                                      */  
/*******************************************************************************************************************/
/*************************************************************************/
/*                      GETTERS METHODS  (READ)                          */
/*************************************************************************/
// Getting token document
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

/*****************************************************************/
/*                      ADD / CREATE METHODS                     */
/*****************************************************************/
// création du token : 32 Bytes random string
tokenSchema.statics.createToken = async function createToken (email) {
    return new Promise(async (resolve,reject) => {
        try {
            // Function inspired from https://stackoverflow.com/questions/8838624/node-js-send-email-on-registration?noredirect=1&lq=1 
            var tokenString; 
            var tokenObject = new token; 
            tokenString = crypto.randomBytes(32).toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
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

/***********************************************************************/
/*                      DELETE METHODS  (Delete)                       */
/***********************************************************************/
// manually delete token  (quand l'utilisateur l'a bien consommé)
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