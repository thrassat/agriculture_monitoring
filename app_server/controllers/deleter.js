'use strict'; 
const {sensorGroup} = require('../../models/sensorGroup')
const {userGroup} = require ('../../models/userGroup');
//const {user} = require('../../models/user');


// TODO INTEGRER ça AUX BONNES PAGES 

/// GROUPE DE CAPTEURS 
module.exports.deleteGroup = async function (req,res) {
    try {
        await sensorGroup.deleteGroupByGroupId(req.params.groupId); 
        // faire cette fonction 
        // si erreur il faut que je retourne sur la bonne page et que je puisse mettre un message d'erreur : redirect aussi avec un paramètre qui va bien ? 
        // pouvoir potentiellement dire que c'est ok avec le redirect index? (un simple alert js ? )
        res.redirect('/gestion-capteurs');
    }
    catch (err) {
        // TODO 
        throw err; 
    }
}

//// GROUPE D'UTILISATEURS 
module.exports.deleteUserGroup = async function (req,res) {
    try {
       
        await userGroup.deleteGroupByName(req.params.groupname); 
        // faire cette fonction 
        // si erreur il faut que je retourne sur la bonne page et que je puisse mettre un message d'erreur : redirect aussi avec un paramètre qui va bien ? 
        // pouvoir potentiellement dire que c'est ok avec le redirect index? (un simple alert js ? )
        res.redirect('/gestion-comptes');
    }
    catch (err) {
        // TODO 
        throw err; 
    }
}

// /// COMPTE UTILSATEUR
// module.exports.deleteUserAccount =async function (req,res) {
//     try {
//         await user.deleteUserByEmail(req.params.email);
//         res.redirect('/gestion-comptes');
//     }
//     catch(err) {
//         // TODO 
//         throw err; 
//     }
// }