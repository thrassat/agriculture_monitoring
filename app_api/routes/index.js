var express = require ('express');
var router = express.Router();
//var ctrlConsultation = require ('../controllers/consultation');
var ctrlDatas = require('../controllers/liveDatas');
var ctrlUsers = require('../controllers/user');
var ctrlUserGroups = require('../controllers/userGroup');
// TODO const ?
// REFAIRE LA STRUCTURE! séparé les routes selon les pages 

/* test tmp , manque au moins l'ID */ 
router.get('/datas',ctrlDatas.listTrios);
router.get('/datas/:trioid',ctrlDatas.readOne);
router.post('/datas',ctrlDatas.addTrio);
router.put('/datas/:trioid',ctrlDatas.updateTrio);
router.delete('/datas/:trioid',ctrlDatas.deleteTrio);

/* début real implement */ 
//SensorGroup
router.get('/livedatas/:sensorgroupname',ctrlDatas.readOneSensorGroup);
router.get('/test',ctrlDatas.test);
router.post('/livedatas',ctrlDatas.addOneSensorGroup); 

//sensors , url path? plus ce que contient le parc que livedatas
router.get('/livedatas/:sensorgroupname/:sensorid',ctrlDatas.readOneSensor);
//add one sensor (+potentiellement automatisé ?) , remove one sensor (+ automatic quand n'envoi plus de données?)
router.post('/livedatas/:sensorgroupname/:sensorid',ctrlDatas.addOneSensor); 

//router.get('/livedatas',ctrlDatas.readAllSensorGroups);

// TODO separate route ! 
router.post('/users',ctrlUsers.addUser) ;
router.post('/userGroups',ctrlUserGroups.addUserGroup); 
router.delete('/users/:email',ctrlUsers.deleteUserByEmail);

module.exports = router ;