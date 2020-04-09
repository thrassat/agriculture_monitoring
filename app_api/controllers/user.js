const mongoose = require('mongoose');

const userModel = mongoose.model('User');
// const groupModel = mongoose.model('UserGroup'); 
const sensorGroupModel = mongoose.model('SensorGroup'); 
var sendJsonResponse ;

// TODO : sortir les requests et les mettre dans les modèles associés! 
//inovquer des fonctions du modèle à la place
// CRUD user 
// Add User 
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

/*
Le group sensor : 5e58375ebab525657c4e0266
Chaque UUID SENSOR 
e44a5322-78f1-40b9-946d-be9ad416679c
b69024cb-f83a-4528-afba-8139be865675
d281a2fb-8300-4c2a-affc-63476bc14f00*/ 
/* TESTING PART */ 

module.exports.listTrios = function (req,res) { 
    sendJsonResponse(res, 200, {"status" : "success"});
};

// works : http://localhost:3000/api/v0/datas/5e4b06d593fd4269ffe8b5de
module.exports.readOne = function(req,res) {
    if (req.params && req.params.trioid) {
        Consult
            .findById(req.params.trioid)
            //.select('temp rh')
            .exec(function(err, consultations) {
                if(!consultations) {
                    sendJsonResponse(res, 404, {
                        "message" : "'trioid' not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 200, consultations);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message" : "No 'trioid' in request"
        });
    }
};

module.exports.addTrio = function (req,res) { 
    Consult.create({
        // validating data in the schema with flags : require, default, minmax...
        temp: req.body.temp,
        rh: req.body.rh,
        co2: req.body.co2,
        "timestamp": req.body.timestamp 
    }, function (err, consultations) {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, consultations);
        }
    });
};

//update ainsi supprimera les paramètres non mis dans la request 
module.exports.updateTrio = function (req,res) { 
    if (!req.params.trioid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, 'trioid' is required"
        });
        return;
    }    
    Consult
        .findById(req.params.trioid)
        .exec(
            function(err,consultations) {
                if (!consultations) {
                    sendJsonResponse(res, 404, {
                        "message": "'trioid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                consultations.temp = req.body.temp;
                consultations.rh = req.body.rh;
                consultations.co2 = req.body.co2;
                consultations.timestamp = req.body.timestamp;
            
                consultations.save(function(err,consultations) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, consultations);
                    }
                });
            }
    );
};

module.exports.deleteTrio = function (req,res) { 
    var trioid = req.params.trioid;
    if (!trioid) {
        //pas utile car sinon ne serait pas routé là ? 
        sendJsonResponse(res, 404, {
            "message": "Not found, 'trioid' is required"
        });
        return; 
    }    
    Consult
        .findByIdAndRemove(trioid)
        .exec(
            function(err,consultations) {
                if (!consultations) {
                    sendJsonResponse(res, 404, {
                        "message": "'trioid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                sendJsonResponse(res, 204, null); 
            }
    );
};

//TODO how to be a common function 
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};