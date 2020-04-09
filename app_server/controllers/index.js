  /*jslint node:true*/
/*eslint-env node*/
'use strict';
const axios = require('axios').default;
axios.defaults.baseURL = "http://localhost:3000";
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = "https://quiet-mountain-46017.herokuapp.com/"
};
//axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var renderIndex = function (req,res,resDatas){
  res.render("index", {  //'locationlist in getting mean
    title: 'Index',
    pageHeader: {
      title:'Groupes de capteurs accessibles : ',
      strapline: 'Date/heure - Lieu'
    },
    //get all sensors groups  
    sensorGroupsList: resDatas
    /*datas: { // use API response 
        temp: resDatas[0].name,
        rh: resDatas[1].name,
        co2: '400'
    }*/
  });
}
/* hard coded part test */
/*GET 'live data' page */
module.exports.listAccessibleSensorGroups = function (req, res) {//passing datas to the view  
  axios({
    method: 'get',
    url: '/api/v0/index',
  // responseType: 'JSON' ? 
  })
    // .then(function (response) {
    //   response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
    // });
  .then(function (response) {
    //console.log(response);
    //console.log(response.data);
    renderIndex(req,res,response.data);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    // always executed
  }); 
  
  //renderIndex(req,res);
};