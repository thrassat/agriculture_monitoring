//var Chart = require('chart.js');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){
    $("button").click(function(){
        $(".test").hide();
    });
});


// ce qu'on a fait : tout encapsulé dans une fonction asynchrone 
// but : pas de probleme de chainage des variables 
// éventuellement voir comment faire autrement.. 
// Sinon faire comme il faut la fonction pour aller chercher les données
// renvoyé les date au format de la timezone et les trier ordre croiss. 
// ou format que l'on souhaite afficher 
// faire avec argument "from-to" 
// éventuellement implémenter un bouton pour décider ça sur le front 
// 
(async() => { 
var ctx = document.getElementById('myChart');
var timezone = document.currentScript.getAttribute('timezone');
var dateDatasArray = [] ;
// (async function() { 
//     try {
//         var axiosRes = await axios.get('/api/v0/datatest') ;
//         console.log(axiosRes.data); 
//     }
//     catch (err) {
//         console.log(err); // how to handle 
//     }

// })()
var getDatas = async function () {
    try {
        var axiosRes = await axios.get('/api/v0/datatest') ;
        console.log(axiosRes)
        return axiosRes.data; 
    }
    catch (err) {
        console.log(err); // how to handle 
    }
};

// build datas array 
var buildArrayDateDatas = async function() {
    var storedJson = await getDatas() ; 
    var dateDatasArray = []; 
    var dateArray = []; 
    var dataArray = []; 
    var date; 
    var value; 
    for (var i=0; i<storedJson.length; i++) {
        // but : ne pas utiliser moment ici mais l'avoir déjà bien formaté 
        // le faire côté serveur quand on récupère dats TODO FIRST 
       // date = moment(storedJson[i].date).tz(timezone).format();
        date = storedJson[i].date; 
        value = storedJson[i].value; 
        //dateDatasArray.push({"date": date,"value":value}); 
        dateArray.push(date);
        dataArray.push(value); 
    }
    dateDatasArray = {"dates":dateArray,"datas": dataArray};
    console.log(dateDatasArray)
    return dateDatasArray; 
};
// Call start
// (async() => {
//     var storedJson = await getDatas() ; 
//     console.log("stored JSON");
//     console.log(storedJson); 
//     dateDatasArray = buildArrayDateDatas (storedJson); 
//     console.log("datesDatasArray");
//     console.log(dateDatasArray); 
//   })();
//   console.log(storedJson);
//   console.log(dateDatasArray); 
dateDatasArray = await buildArrayDateDatas (); 
//console.log(dateDatasArray);
/****************************************** Begin Tests***************************************************************************************************/
/* test getting datas */
// var this_js_script = $('script[src*=history]'); // or better regexp to get the file name..
// var my_var_1 = this_js_script.attr('datas');    
// console.log(datas); // string 
// console.log(typeof datas); 
// console.log(my_var_1); // but string 
//console.log(glob) ; // non défini 
// Options : Faire un axios pour recup les données dans le controller et var globale (pas réussi encore) ou un ajax (entre ce file et l'HTML pour avoir les donnée)
// faire un axios d'ici ou un ajax ! 
// go test axios ici 
/**************************************************End TESTS ********************************************************************* */

var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dateDatasArray.dates,
        datasets: [{
            label: '# of Votes',
            data: dateDatasArray.datas,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
})(); 