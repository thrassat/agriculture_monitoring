var express = require ('express');
var router = express.Router();

/*************** API controllers ***************/
var ctrlDatasReceiver = require('../controllers/datasReceiver');

/************************************************************************************************************/
/*                                          API ROUTES                                                      */  
/************************************************************************************************************/
/********************************/
/*        DATAS RECEIVER        */
/********************************/

// 1er Post de l'arduino reçu ici (setup) 
// body : arduinouniqueid-sensorA-sensorB-sensorX
router.post('/ardSetup',ctrlDatasReceiver.ardSetup);

// Route de réception des données 
// body : epoch value
router.post('/receiver/:groupId/:sensorId',ctrlDatasReceiver.postProcess);

// // old 
//router.post('/receiver/:sensorid',ctrlDatasReceiver.postProcess); old
// router.post('/groupsetup',ctrlDatasReceiver.groupSetup); 
//receive post request from arduino 
// router.post('/test/:sensorid',ctrlDatasReceiver.printPost); //  id param for plain text http post, remove :sensorId for Json send
module.exports = router ;