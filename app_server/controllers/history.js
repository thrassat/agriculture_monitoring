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


var renderHistoryPage = function (req,res,datasInfo,datas){
  res.render('history', { 
    styles: [],
    headScripts: [],
    bodyScripts: ["history.js"],
    title: 'Datas History',
    pageHeader: {
      title:'Historique des données ',
      //strapline: 'Date/heure - Lieu'
    },
    datasInfo: datasInfo,
    datas: datas,
  });
}
/* hard coded part test */
/*GET 'live data' page */
module.exports.displayDatasHistory = async function (req, res) {//passing datas to the view   
  try {
    var sensorid = req.params.sensorid; 
    var datas = [12, 19, 3, 5, 2, 3];
    renderHistoryPage(req,res,sensorid,datas);
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};