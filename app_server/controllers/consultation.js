/*jslint node:true*/
/*eslint-env node*/
'use strict';

/*GET 'live data' page */
module.exports.livedata = function (req, res) {//passing datas to the view   
    res.render('live-data', { 
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