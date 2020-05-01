  /*jslint node:true*/
/*eslint-env node*/
'use strict';
// todo add has helpert or export module in other file? 
var moment = require('moment-timezone');
const axios = require('axios').default;
axios.defaults.baseURL = "http://localhost:3000";
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = "https://quiet-mountain-46017.herokuapp.com/"
};
//axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';


var renderLivePage = function (req,res,datasInfo){
  res.render('live', {  //'locationlist in getting mean
    title: 'Live datas',
    pageHeader: {
      title:'Données en temps réel ',
      //strapline: 'Date/heure - Lieu'
    },
    datasInfo: datasInfo,
  });
}
/* hard coded part test */
/*GET 'live data' page */
module.exports.displayLiveDatas = async function (req, res) {//passing datas to the view   
  try {
    //console.log(req.params.groupid); 
    var groupid = req.params.groupid;
    // const vs let ? let vs var (let n'est déclaré qu'entre les accolades de sa déclaration)
    const response = await axios.get('/api/v0/live/'+groupid);
    let sensors = response.data.sensors; 
    let timezone = response.data.timezone; 
    var dataPacket ; 
    var name ; 
    var dataType ; 
    var value;
    var timestamp ; 
    var dataArray = [];
    // get last data for all sensors of the group
    for (var i=0; i < sensors.length; i++) {
      //getting stored datas last document
      dataPacket = await axios.get('/api/v0/live/lastdata/'+sensors[i].sensorid); 
      //getting name of the sensor
      name = sensors[i].name; 
      //creating array to send to the page
      value = dataPacket.data.value;
      timestamp = moment(dataPacket.data.date).tz(timezone).format();
      dataType = sensors[i].sensorid.split("-")[1];
      dataArray.push({"name": name,"type":dataType, "value":value, "timestamp":timestamp, "id":sensors[i].sensorid}); 
    }
   // console.log(dataArray); 
    // here to do : get last data for each sensors , create an array to send to the render function 
    renderLivePage(req,res,dataArray);//,response.data); 
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};