 /*jslint node:true*/
/*eslint-env node*/
'use strict';

/*************** Render & datas ***************/
var renderAboutPage = function (req,res,content){
  res.render('about', { 
    styles: [],
    headScripts: [],
    bodyScripts: [],
    title: 'About',
    pageHeader: {
      title:'About',
      //strapline: 'Date/heure - Lieu'
    },
    content: content,
  });
}

/*************** Function called by routes ***************/
module.exports.renderAbout = async function (req, res) { 
  try { 
    var content = "About content"; 
    renderAboutPage(req,res,content);
  } 
  catch(err) {
    console.log(err); 
    throw err;
    // todo how to handle error ?
  }
};