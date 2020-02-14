/*jslint node:true*/
/*eslint-env node*/
'use strict';
/* GET 'about' page */
module.exports.about = function (req, res) {
  res.render('about', {
    title: 'About',
    content: 'About content'
    });
};
