var express = require ('express');
var router = express.Router();

var ctrlUsers = require('../controllers/user');
var ctrlLive = require('../controllers/live')
var ctrlIndex = require ('../controllers/index');
var ctrlSensorManager = require ('../controllers/sensorManager')
var ctrlUserGroups = require('../controllers/userGroup');
var ctrlDatasReceiver = require('../controllers/datasReceiver');
var ctrlHistory = require('../controllers/history');
// TODO const ?
// REFAIRE LA STRUCTURE! séparé les routes selon les pages 

/************************************************************************************************************/
/*                                          API ROUTES                                                      */  
/************************************************************************************************************/

/********************************/
/*              USERS           */
/********************************/
router.post('/users',ctrlUsers.addUser) ;
router.post('/userGroups',ctrlUserGroups.addUserGroup); 
router.delete('/users/:email',ctrlUsers.deleteUserByEmail);

/********************************/
/*              INDEX           */
/********************************/
router.get('/index',ctrlIndex.getAllSensorGroups);
//router.get('/testindex',ctrlIndex.testgetall);

/********************************/
/*              LIVE            */
/********************************/
router.get('/live/:groupid',ctrlLive.getSensors);
router.get('/live/lastdata/:sensorid',ctrlLive.getLastData);


/*********************************/
/*            HISTORY            */
/*********************************/
router.get('/datatest/',ctrlHistory.getDatasTest)
router.get('/groupinfos/:groupid',ctrlHistory.getSensorGroupInfos)

/********************************/
/*       MANAGE SENSORS         */
/********************************/
router.post('/add/:groupid',ctrlSensorManager.addSensorGroup); // add new sensorgroup
router.post('/add/:groupid/:datatype',ctrlSensorManager.addSensorToGroup); 

/********************************/
/*        DATAS RECEIVER        */
/********************************/
// Testing receive post request from arduino 
router.post('/test/:sensorid',ctrlDatasReceiver.printPost); //  id param for plain text http post, remove :sensorId for Json send
router.post('/receiver/:sensorid',ctrlDatasReceiver.postProcess);


/* 1er tests tmp , manque au moins l'ID */ /*
router.get('/datas',ctrlDatas.listTrios);
router.get('/datas/:trioid',ctrlDatas.readOne);
router.post('/datas',ctrlDatas.addTrio);
router.put('/datas/:trioid',ctrlDatas.updateTrio);
router.delete('/datas/:trioid',ctrlDatas.deleteTrio);
*/

// //SensorGroup
// router.get('/livedatas/:sensorgroupname',ctrlDatas.readOneSensorGroup);
// //router.get('/test',ctrlDatas.test);
// router.post('/livedatas',ctrlDatas.addOneSensorGroup); 

// //sensors , url path? plus ce que contient le parc que livedatas
// router.get('/livedatas/:sensorgroupname/:sensorid',ctrlDatas.readOneSensor);
// //add one sensor (+potentiellement automatisé ?) , remove one sensor (+ automatic quand n'envoi plus de données?)
// router.post('/livedatas/:sensorgroupname/:sensorid',ctrlDatas.addOneSensor); 

// //router.get('/livedatas',ctrlDatas.readAllSensorGroups);

module.exports = router ;