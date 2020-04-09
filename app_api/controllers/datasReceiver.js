const mongoose = require('mongoose');

var storedDatasModel = mongoose.model('StoredData');
var sensorGroupsModel = mongoose.model('SensorGroup');
var sendJsonResponse ;

sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

// TODO METTRE LES REQUEST DANS LES MODELES !!! 

// todo "quand je reçois un http post ici, créer les " stored datas" associées en base " (MQTT?)
// 1) afficher le contenu du post reçu ok
// 2) Prévoir une réponse JSON (dans le content, créer mon standard ou voir comment utiliser httpclient de l'arduino) attestant la bonne réception ou pouvant renvoyer a l'arduino une erreur pour qu'il renvoi? 
// 3) Find le Capteur ID associé en base, ajouter les données en base selon le format requis
// 4) Relier au scd30 + processus d'enregistrement 

module.exports.printPost = function (request, response) {
    console.log(request.body+ " --");
    console.log(request.params+ " --");
    console.log(request.params.id+ " --");
    sendJsonResponse(response,200,{
        "message": "post received"
    }); // en profiter pour renvoyer quelque chose ? Pas au format JSON? 
    // also todo : limit amount of incoming datas // de base limité par express .. pas sur nécessaire (lib : stream-meter for example)
} 
// Official documentation for Node HTTP : https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
// Official express documentation https://expressjs.com/en/4x/api.html#express

// function to verify sensor id related sensor and create new document in related stored datas 
module.exports.postProcess = function(request,response) {
    console.log(request.body); 
    // use http.createServer ? Non car implémenté similairement par midleware express et dans les routes déjà 
    // sensor group en base : "_id" : ObjectId("5e5d3f9ed99ab09984a17e5c"),
    // "name" : "indoor1",
    // sous document d'1 sensor en base "_id" : "e44a5322-78f1-40b9-946d-be9ad416679c",
    // 		"name" : "SCD-30-T",
    // Pré enregistré 3 capteurs différent pour le scd
    // Stored data sont stocké comme ça directement : (fields : date, sensorId, value) 
    // But : retrouvé l'ID du sensorId passé pour savoir quel type de donnée on reçoit et qu'il est effectivement bon 
    // TODO : le sensor ID en paramètre de l'URL et non comme un field JSON
    if (!request.body.sensorId) {
         // sensorid pas dans la requete post
        sendJsonResponse(response,404, {
            "message": "Field sensorId missing in post request"
        });
    }
    else {
        // find the sensor to check what will be the "value" field 
        // help https://stackoverflow.com/questions/21142524/mongodb-mongoose-how-to-find-subdocument-in-found-document 

        // renvoi le doc du sensor-grp entier (query avec l'id d'un sensor) db.sensorgroups.find({sensors:{$elemMatch: {_id:"e44a5322-78f1-40b9-946d-be9ad416679c"}}}).pretty();
        console.log(request.body.sensorId);//test
        // TODO : Sortir la request du controleur ! dans le modèle !!! 
        // ici appeler : "datatype = getDataTypeBySensorId (sensorId)"
        // Traiter ensuite pour créer le document à store en base 
        // appeler : "storeDatasBySensorId (JSON doc, sensorId )"

        sensorGroupsModel
            //.find({sensors: {$elemMatch: {_id:request.body.sensorId}}}) //works too
            .find({'sensors._id': request.body.sensorId })
            .select('sensors') // garder seulement le field sensor du document sensorgroup retourné
            .exec(
                function (err,sensorgroup) { 
                    var sensor;
                    if(!sensorgroup) {
                        sendJsonResponse(response, 404, {
                            "message" : "Le sensor Group du capteur n'a pas été trouvé" // en fonction du field sensorId de la post request
                        });
                        return;
                    } else if (err) {
                        sendJsonResponse(response, 400, err); 
                        return;
                    }
                    else if (sensorgroup.length!==1) {
                        //error car plus d'un sensor group renvoyé
                        sendJsonResponse(response, 400, 404, {
                            "message" : "Erreur avec l'id du sensor, l'id est présent dans plusieurs sensorgroups?"
                        });
                        return;
                    }
                    else {
                        sensor = sensorgroup[0].sensors.id(request.body.sensorId);
                        console.log(sensor); 
                        if (!sensor) {
                            sendJsonResponse(response, 404, {
                                "message" : "Le sensor cherché n'a pas été trouvé" // on ne devrait pas pouvoir passer ici
                            });
                        }
                        else {
                            // on a le sous-document du sensor concerné dans la variable sensor, on récupère son type dans le field datatype 
                            console.log(sensor.dataType); 
                            // prendre la décision de comment sont transmis les informations notamment pour le scd3à qui envoit 3 valeurs
                            // Ici ce sera un switch , permettant de selon datatype traité différement, on peut ne pas se bloquer sur ça 
                            if (sensor.dataType=='Temperature') {
                                // tester un mongoose save, voir doc officielle, mettre en forme datas 
                            }
                            // OPTIONS : 
                            //      - dataType est enfait lié au modèle du capteur, on sait donc le type de donnée qu'il retourne, unarray de 3 valeurs pour le scd?
                            //      - On enregistre effectivement 3 capteurs différents, un par grandeur, on envoi un post par grandeur, le field datatype sera général pour la température par exemple on veut juste un int
                            //      - On permet un entre 2 : datatype style : scd-array et on sait ou recup notre grandeur et quoi
                            //   Question à se poser , comment on va récupérer les stored datas aussi ? ça va être via sensorgroup 
                            // qui ira chercher ensuite tous les id de sensors contenus dans ce sensorgroup, puis qui ira chercher les stored data en lien avec ces ids 
                            // DEmain commecner par brancher le scd30 sur le nouvel arduino, se plionger un peu dans l'utilisation 
                            sendJsonResponse(response,200,sensor);
                        }

                    }
                }
            );
        // sendJsonresponse(response,200,{
            // "message": "Post well received"
        // });
    }
}
