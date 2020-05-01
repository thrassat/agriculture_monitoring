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
    //get all sensors groups  , return all fields to index
    //change names 
    // todo return au niveau de la request du model ou a une autre étape que ce qui nous intéresse
    sensorGroupsList: resDatas
    /*datas: { // use API response 
        temp: resDatas[0].name,
        rh: resDatas[1].name,
        co2: '400'
    }*/
  });
}

/*GET 'ALL SENSORS GROUPS FOR INDEX PAGE */
module.exports.listAccessibleSensorGroups = async function (req,res) {
  // remove req where unuseful? 
//https://www.twilio.com/blog/5-ways-to-make-http-requests-in-node-js-using-async-await
  try {
    const response = await axios.get('/api/v0/index') ;
    renderIndex(req,res,response.data); 
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};
/* FIRST VERSION */
/*
module.exports.listAccessibleSensorGroups1 = function (req, res) {//passing datas to the view  
  axios({
    method: 'get',
    url: '/api/v0/index',
  // responseType: 'JSON' ? JSON parse by default 
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
};*/



