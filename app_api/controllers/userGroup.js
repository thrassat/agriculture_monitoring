var mongoose = require('mongoose');


var userGroupModel = mongoose.model('userGroup');
var sendJsonResponse ;
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// CRUD user 
// TODO ADD METHODS HAS MONGOOSE SCHEMA STATICS METHODS 
// En standby 

/* NOT USED */


/*************************************************************/
/*                  ADD USER GROUP                           */
/*************************************************************/
module.exports.addUserGroup = function (req,res) {
       console.log(req.body);
       var userGroup = new userGroupModel({
           // comment ajouter les checks pour l'ajout ? TODO, check getting mean..
            name: req.body.name
       }); 
       userGroup.save(function(err,inserted){
           if (err) {
               console.log(err);
               sendJsonResponse(res, 400, inserted) ;
           } else {
               sendJsonResponse(res, 201, inserted) ;
           }
       });
   };