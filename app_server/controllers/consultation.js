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

var renderHomepage = function (req,res){
  res.render('live-data', {  //'locationlist in getting mean
    title: 'Live data',
    pageHeader: {
      title:'Données en temps réel',
      strapline: 'Date/heure - Lieu'
    },
    datas: {
        temp: '20',
        rh: '80',
        co2: '400'
    }
  });
}
/* hard coded part test */
/*GET 'live data' page */
module.exports.livedata = function (req, res) {//passing datas to the view   
  renderHomepage(req,res);
};

/*GET 'historic' page */
module.exports.historic = function (req, res) {
    res.render('historic', {
      title: 'Historic', 
      sidebar: 'Sidebar content ...',
      datas_historic: {
        temp: 'faire passer historique de données',
        date: 'depuis quand ? comment ? ... '
      }
    }
  );
}; 

/* hard coded part test */
/*GET 'live data' page */
// module.exports.livedata = function (req, res) {//passing datas to the view   
//   res.render('live-data', { 
//     title: 'Live data',
//     pageHeader: {
//       title:'Données en temps réel',
//       strapline: 'Date/heure - Lieu'
//     },
//     datas: {
//         temp: '20',
//         rh: '80',
//         co2: '400'
//     }
//   });
// };
