  /*jslint node:true*/
/*eslint-env node*/
'use strict';

const {sensorGroup} = require('../../models/sensorGroup') 

// from https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript 
var chunkArray = function (myArray, chunk_size){
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];
  var myChunk; 
  for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index+chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
  }
  return tempArray;
}

/*************** Render & datas ***************/
var renderIndex = function (req,res,sensorGroupsList){
  res.render("index", {
    title: 'Index',
    pageHeader: {
      title:'Groupes de capteurs accessibles : ',
      strapline: 'Voici la liste des groupes de capteurs confirmés auxquels vous avez accès' //todo
    },
    //get all sensors groups  , return all fields to index
    //change names 
    // todo return au niveau de la request du model ou a une autre étape que ce qui nous intéresse
    sensorGroupsList: sensorGroupsList,
  });
}
/*************** Function called by routes ***************/
/*GET 'ALL SENSORS GROUPS AVAILABLE FOR INDEX PAGE */
module.exports.renderIndexWithDatas = async function renderIndexWithDatas (req,res) {
  // req res useful ? 
  try { 
    let groups = await sensorGroup.getAllConfirmedSensorGroups(); 
    //Fixing Handlebars issue: Access has been denied to resolve the property "uniqueid" because it is not an "own property" of its parent.
    // https://github.com/handlebars-lang/handlebars.js/issues/1642 
    groups = groups.map(e => e.toJSON());
    var chunked = chunkArray(groups,3);
    renderIndex(req,res,chunked);
  }
  catch (err) {
    throw err; 
  }
};

/*************** Function called by routes ***************/
/*GET 'ALL SENSORS GROUPS AVAILABLE FOR INDEX PAGE */
/*module.exports.listAccessibleSensorGroups = async function (req,res) {
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
};*/
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



