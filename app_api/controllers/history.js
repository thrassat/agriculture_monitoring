const mongoose = require('mongoose');
var moment = require('moment-timezone');

const {sensorGroup} = require('../models/sensorGroup')
const {storedDatas} = require('../models/storedDatas')
var sendJsonResponse 
sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/**********************************************************/
/*              GET SENSOR GROUP INFO BY ID               */
/**********************************************************/
module.exports.getSensorGroupInfos = async function (req,res) {
    try {
        // name & timezone mais on peut demaner plus/moins 
        let groupinfo = await sensorGroup.getSensorGroupInfosById(req.params.groupid); 
        sendJsonResponse(res,200,groupinfo); 
    }
    catch (err) {
        sendJsonResponse(res,404, {
            "message": "get sensor group info by id error "
        });
    }
    return; 
}


/************************************************/
/*              GET DATAS TEST                  */
/************************************************/
module.exports.getDatasTest = async function (req,res) {
    var dateDataArray = [];
    try {
        // date need to be on string format : converti explicitement en date ici ou par la méthode du modèle 
        datas = await storedDatas.getDatasFromTo("f39205955150484347202020ff132a1f-temp",'2019','2021'); 
        console.log(datas);
        // get timezone ? sinon pas bon forma pour la date
        for (var i=0; i<datas.length; i++) {
          //  dateDataArray.push({"date":})
        }
        sendJsonResponse(res,200,datas);
    }
    catch (err) {
        sendJsonResponse(res,404, {
            "message": "get datas test error "
        });
        // todo throw error ?
    }
    return;
}

module.exports.getDatas = async function (req,res) {
    var dateDataArray;
    var datas; 
    console.log("UEEE");
    try {
        var range = req.params.range;
        var sensorId = req.params.sensorid;
        var timezone = req.query.tz ; 
        // todo améliorer la manière d'avoir ces infos ici ? 
        console.log(range);
        console.log(sensorId);
        console.log(timezone);
        console.log(" ............... ");
        var nowTmp = moment().tz(timezone);
        var now = moment().tz(timezone); 
        var from ;
        switch(range) {
            case 'day':
                from = nowTmp.subtract(1,'days'); 
                console.log(" -1 jour");
                console.log(from.format()); 
                datas = await storedDatas.getDatasFromTo(sensorId,from.format(),now.format()); 
                break;
            case 'week':
                from = nowTmp.subtract(7,'days'); 
                console.log( " -1 week"); 
                console.log(from.format()); 
                datas = await storedDatas.getDatasFromTo(sensorId,from,now); 
                break; 
            case 'month':
                from = nowTmp.subtract(1, 'months');
                console.log( " -1 month"); 
                console.log(from.format()); 
                console.log(now.format()); 
                datas = await storedDatas.getDatasFromTo(sensorId,from.format(),now.format()); 
                break;
            case 'year':
                from = nowTmp.subtract(1,'years');
                console.log( " -1 year"); 
                console.log(from.format()); 
                datas = await storedDatas.getDatasFromTo(sensorId,from.format(),now.format()); 
                break;
            case 'ever':
                datas = await storedDatas.getAllDatas(sensorId); 
                break; 
            default: 
                console.log("todo default case");
                break; 
        }
        dateDataArray = buildArrayDateDatas(datas,timezone); 
        // date need to be on string format : converti explicitement en date ici ou par la méthode du modèle 
        //datas = await storedDatas.getDatasFromTo("f39205955150484347202020ff132a1f-temp",'2019','2021'); 
        //console.log(datas);
        // get timezone ? sinon pas bon forma pour la date
        // datas : {date =s [], values=[]}
        sendJsonResponse(res,200,dateDataArray);
    }
    catch (err) {
        sendJsonResponse(res,404, {
            "message": "get datas test error "
        });
        // todo throw error ?
    }
    return;
}

// build datas array 
var buildArrayDateDatas = function(storedJson,tz) {
    var dateDatasArray = []; 
    var dateArray = []; 
    var dataArray = []; 
    var date; 
    var value; 
    for (var i=0; i<storedJson.length; i++) {
        date = moment(storedJson[i].date).tz(tz).format(); 
        value = storedJson[i].value; 
        dateArray.push(date);
        dataArray.push(value); 
    }
    dateDatasArray = {"dates":dateArray,"datas": dataArray};
    return dateDatasArray; 
};

