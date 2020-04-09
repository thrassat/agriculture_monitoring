var mongoose = require('mongoose');


var userGroupModel = mongoose.model('UserGroup');
var sendJsonResponse ;

// TODO : sortir les requests et les mettre dans les modèles associés! 
//inovquer des fonctions du modèle à la place
// CRUD user 

module.exports.addUserGroup = function (req,res) {
    // ajout de tout sauf capteurs ? et ajout un a un ensuite ?
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

/*
Le group sensor : 5e58375ebab525657c4e0266
Chaque UUID SENSOR 
e44a5322-78f1-40b9-946d-be9ad416679c
b69024cb-f83a-4528-afba-8139be865675
d281a2fb-8300-4c2a-affc-63476bc14f00*/ 

//TODO how to be a common function for the application 
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};