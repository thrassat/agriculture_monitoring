const {user} = require('../../models/user') ; 
const {token} = require('../../models/token')
const validator = require('express-validator');
const { body } = require('express-validator');
//const userGroup = require('../../models/userGroup');

// cette page doit affihcer la possibilité de modifier l'username et le password 
// et vérfieir que le token est bien actif 
/*************** Render & datas ***************/
var renderUserValidation = function (req,res,userDatas,formErrors, mongooseErrors, validations,token){
    res.render("account-validation", {
      styles: [],
      headScripts: [],
      title: "Validation",
      layout: 'loginLayout',
      pageHeader: {
        title: "Finalisez la création de votre compte",
        strapline: "Complétez le formulaire suivant pour valider votre compte et accéder à l'application"
      },
      user: userDatas,
      formErrors: formErrors,
      mongooseErrors: mongooseErrors,
      validations: validations, 
      token: token,
    });
    // if (validations !== []) {
    //   setTimeout(function(){
    //     res.redirect('/login')
    //  }, 10000);
    // }
}
/*************** Render & datas ***************/
var renderResetPwd = function (req,res,userDatas,formErrors, mongooseErrors, validations,token){
  res.render("account-validation", {
    styles: [],
    headScripts: [],
    title: "Reset",
    layout: 'loginLayout',
    pageHeader: {
      title: "Réinitialiser ici votre mot de passe",
      strapline: "Complétez le formulaire suivant pour réinitialiser votre mot de passe. Vous pouvez aussi modifier votre nom d'utilisateur si vous le souhaitez."
    },
    user: userDatas,
    formErrors: formErrors,
    mongooseErrors: mongooseErrors,
    validations: validations, 
    token: token,
  });
  // if (validations !== []) {
  //   setTimeout(function(){
  //     res.redirect('/login')
  //  }, 10000);
  // }
}


/*************** Function called by get route ***************/
module.exports.displayUserValidation= async function displayUserValidation (req,res) {
  // req res useful ? 
  try {  
      // idée : aller chercher l'utilisateur via le model token : s'il n'y a pas de correspondance le token est expiré
      // s'il y a correspondance on récupère l'objet utilisateur en question et on va aller le modifier grâce au formulaire sur la page
      // potentiellement ça servira pour un reset de mot de passe
    var mongooseErrors = []; 
    var tokenObject = await token.getTokenObject (req.params.token);   

    if (tokenObject) {
        tokenObject = tokenObject.toJSON(); 
        var userDatas;
        userDatas = await user.getUserByEmail(tokenObject.email)
        userDatas = userDatas.toJSON(); 
        console.log(req.query.reset)
        console.log(req.query.reset == 'true')
        if (req.query.reset === 'true') {
          console.log(req.query)
          console.log("aaaaa")
          renderResetPwd(req,res,userDatas,[],[],[],tokenObject);
        }
        else {
          renderUserValidation(req,res,userDatas,[],[],[],tokenObject)
        }
            }
    else {
        renderUserValidation(req,res,[],[],[],[],"expired")
    } 
    //userGroups = userGroups.map(e=>e.toJSON());
 //   renderUserValidation(req,res,userDatas,[],[],[]);
  }
  catch (err) {
    //USE FLASH ??
    mongooseErrors.push(err);
    renderUserValidation(req,res,userDatas,[],mongooseErrors,[],tokenObject)
  }
}; 


module.exports.postUserValidation = [
  body('username').trim().escape(),
  body('password').trim().escape(),
  async function postUserValidation (req,res) {
    try {
      var formErrors = [];
      var mongooseErrors = [];
      var validations = [];
      var uz = new Object();
      formErrors = validator.validationResult(req);
      var tokenObject = await token.getTokenObject (req.params.token);
      if (tokenObject) {
        var userDatas;
        userDatas = await user.getUserByEmail(tokenObject.email)
        //if not findOne console.log(userDatas[0].email)
        tokenObject = tokenObject.toJSON(); 
        // vérifier le formulaire 
        if (!formErrors.isEmpty()) {
        // todo with right arguments 
          if (req.query.reset === 'true') {
            renderResetPwd(req,res,userDatas,formErrors.errors,mongooseErrors,validations,tokenObject);
          }
          else {
            renderUserValidation(req,res,userDatas,formErrors.errors,mongooseErrors,validations,tokenObject);
          }
        }
        else {
          uz.username = req.body.username; 
          uz.password = req.body.password ; 
          uz.email = userDatas.email; 
          await user.updateUser(uz); 
          await token.deleteToken(tokenObject.email);
          validations.push("Vos informations ont été modifiées avec succès, vous allez être redirigé vers la page de connexion...")
          if (req.query.reset === 'true') {
            renderResetPwd(req,res,userDatas,[],[],validations,tokenObject);
          }
          else {
            renderUserValidation(req,res,userDatas,[],[],validations,tokenObject);
          }
        
        }
      // essayer de sauvegarder les modifications 
      // display error message et possibilité de réessayer 

      // ou valider : message de validation et redirect a la page de connexion 
      }
      else {
          renderUserValidation(req,res,[],[],[],[],"expired");
      }
  
    }
    catch (err) {
      // render avec error ?
     // console.log(err); 
      mongooseErrors.push(err);
      renderUserValidation(req,res,userDatas,[],mongooseErrors,[],tokenObject)

    }
  }
];