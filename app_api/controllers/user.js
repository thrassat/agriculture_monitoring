const mongoose = require('mongoose');

const userModel = mongoose.model('User');
// const groupModel = mongoose.model('UserGroup'); 
const sensorGroupModel = mongoose.model('SensorGroup'); 
var sendJsonResponse ;
//TODO how to use as common function 
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// CRUD user 
// TODO ADD METHODS HAS MONGOOSE SCHEMA STATICS METHODS 
// En standby 

/*****************************************************************************/
/*                  CRUD USER FIRST VERSION                                  */
/*****************************************************************************/

/*************************************************************/
/*                  ADD USER                                 */
/*************************************************************/
//try with create method 
module.exports.addUser = function (req,res) {
    console.log(req.body.accessTo)
    console.log(req.body.accessTo._id)
    // traiter l'array si plusieurs avec un for ? et faire des push pour le doc crée ? 
    userModel.create({
        username: req.body.username,
        password: req.body.password,
        // todo dans Gettingmean book : hash & salt en string
        email: req.body.email,
        role: req.body.role,
        // sans le split marche pour un ... 
        // contournement en ajoutant les groupes après ou? ... 
        //TODO gérer ça comme il faut , standby
        group: {group: req.body.group}, //multiple don't works
        // split en array si plusieurs mais : cast ObjectId error
        //group: req.body.group.split(","),
        //try using id of schema 
        accessTo: req.body.accessTo._id,
    }, function (err,created) {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, created);
        }
    });
};

// P190 GETTING MEAN : faire l'ajout par subdocuments 
/*************************************************************************/
/*                  DELETE USER BY EMAIL                                 */
/*************************************************************************/
module.exports.deleteUserByEmail = function (req,res) {
    var userEmail = req.params.email; 
    if (userEmail) {
        userModel
        .findOneAndDelete(userEmail)
        .exec(
            function(err,deleted) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 204, null) ; 
            }
        );
    } else {
        sendJsonResponse(res, 404, {
            "message" : "No user email"
        });
    }
};