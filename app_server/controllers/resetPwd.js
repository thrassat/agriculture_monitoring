const {user} = require('../../models/user') ; 
const {token} = require('../../models/token')
const validator = require('express-validator');
const { body } = require('express-validator');
const mailer = require('../helpers/mailer');


module.exports.resetPwd = [
    body('userMail').trim().escape(),
    
    async function resetPwd(req,res) {
        try {
            formErrors = validator.validationResult(req);
            if (!formErrors.isEmpty()) {
                return res.redirect('/login?info='+formErrors.errors);                              
            }
            else {
                var email = req.body.userMail; 
                // vérifier que ce mail est lié à un utilisateur 
                var userObj = await user.getUserByEmail(email) ; 
                // null if not exist 
                if (userObj) {
                    var tokenString = await token.createToken(userObj.email); 
               //     await user.deletePwd(userObj.email); 
                    // send email 
                    await mailer.sendResetPwdMail(userObj.email,tokenString); 
                    return res.redirect('/login?info='+"Une e-mail pour réinitialiser votre mot de passe vous a été envoyé")
                }
                else {
                    return res.redirect('/login?info='+"Cette adresse e-mail n'est pas associé à un compte utilisateur");
                }
            }
       
        }
        catch(err) {    
            console.log(err); 
            // HOW TO HANDLE ?
            return res.redirect('/login?info='+"Une erreur est survenue, veuillez réessayer"); 
        }
    }
];