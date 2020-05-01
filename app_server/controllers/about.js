 /*jslint node:true*/
/*eslint-env node*/
'use strict';

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
/* hard coded part test */
/*GET 'live data' page */
module.exports.renderAbout = async function (req, res) {//passing datas to the view   
  try { 
    var content = "About content"; 
    renderAboutPage(req,res,content);
  } 
  catch(err) {
    console.log(err); 
    // todo how to handle error ?
  }
};