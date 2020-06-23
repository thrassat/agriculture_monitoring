//var Chart = require('chart.js');

////////////////////////////////////////////////////////////////////////////////////////////
/******************** VANILLA *******************************************************/
// helper from https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/ 
function getAjax(url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}
/*************** Getting elements ***************/
var select = document.getElementById('daterange'); 
var ctx = document.getElementById('myChart');
var sensorId = document.currentScript.getAttribute('sensorId');
var timezone = document.currentScript.getAttribute('timezone');
var myChart; 

//com1                                                      

// My helper to update datas 
var getAndUpdateDatas = function (chart) {
    try {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
        getAjax('/api/v0/history/datas/'+sensorId+'/'+select.value+'?tz='+timezone, function(data){
            var json = JSON.parse(data);
            // console.log("from AJAX: ");
            // console.log(json); 
            // removeDatas(myChart); 
            // for (var i=0; i<json.dates.length; i++) {
            //     addData(myChart,json.dates[i], json.datas[i]);
            // };
            chart.data.datasets[0].data = json.datas; 
            chart.data.labels = json.dates; 
            chart.update();
        });
    }
    catch (err) {
        //how to handle , todo
        console.log(err);
    }
};

function createConfig(position) {
    return {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
              //  label: 'My First dataset',
                borderColor: 'red',
                backgroundColor: 'green',
                data: [],
                fill: false,
            }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: ' Todo titre'
            },
            tooltips: {
                position: position,
                mode: 'index',
                intersect: false,
            },
            scales: {
                yAxes: [{
                    ticks: {
                       beginAtZero: true // if we want to begin y label at 0 (how about negative temp? )
                    }
                }],
                xAxes: [{
                    type: 'time'
                }]
            }
        }
    };
};

/*************** Actions ***************/
// 
window.onload = function() {
    // position from chart js documentation
    var container = document.querySelector('.main-chart-container');
// au besoin ajouter des arguments pour généré dynamiquement plusieurs graphiques
// todo selon renu final pas besoin de mettre la position comme argument (surtout si on a qu'un graphe ici)

    ['nearest'].forEach(function(position) {
        var div = document.createElement('div');
        div.classList.add('chart-container');
        var canvas = document.createElement('canvas');
        div.appendChild(canvas);
        container.appendChild(div);
        var ctx = canvas.getContext('2d');
        var config = createConfig(position);
        myChart = new Chart(ctx, config);
        this.getAndUpdateDatas(myChart); 
    });
};

select.onchange = function () { //works 
    console.log(select.value);                                                                                                                                                                                                                                                              
    getAndUpdateDatas(myChart); 
}; 

// do on change/ click / modifier le dataset 

// ce qu'on a fait : tout encapsulé dans une fonction asynchrone 
// but : pas de probleme de chainage des variables 
// éventuellement voir comment faire autrement.. 
// Sinon faire comme il faut la fonction pour aller chercher les données
// renvoyé les date au format de la timezone et les trier ordre croiss. 
// ou format que l'on souhaite afficher 
// faire avec argument "from-to" 
// éventuellement implémenter un bouton pour décider ça sur le front 
// 
//------ je veux : un boutton qui défile : permettant de choisir déjà : afficher les données : 
//sur l'année, sur le mois, sur la semaine, sur le jour, depuis toujours
//principe : faire choisir à l'utilisateur : form ? 

/* first version 
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
*/


// com1


// var config = {
//     type: 'line',
//     data: {
//         labels: [],
//         datasets: [{
//             //label: '# of Votes',
//             data: [],
//             backgroundColor: [
//                 'rgba(255, 99, 132, 0.2)',
//                 'rgba(54, 162, 235, 0.2)',
//                 'rgba(255, 206, 86, 0.2)',
//                 'rgba(75, 192, 192, 0.2)',
//                 'rgba(153, 102, 255, 0.2)',
//                 'rgba(255, 159, 64, 0.2)'
//             ],
//             borderColor: [
//                 'rgba(255, 99, 132, 1)',
//                 'rgba(54, 162, 235, 1)',
//                 'rgba(255, 206, 86, 1)',
//                 'rgba(75, 192, 192, 1)',
//                 'rgba(153, 102, 255, 1)',
//                 'rgba(255, 159, 64, 1)'
//             ],
//             borderWidth: 1
//         }]
//     },
//     // chart example https://github.com/chartjs/Chart.js/blob/master/samples/scales/time/line.html 
//     //https://www.chartjs.org/docs/latest/axes/cartesian/time.html
//     options: {
//         responsive: true,
//         scales: {
//             yAxes: [{
//                 ticks: {
//                    beginAtZero: true // if we want to begin y label at 0 (how about negative temp? )
//                 }
//             }],
//             xAxes: [{
//                 type: 'time'
//             }]
//         }
//     }
// };

// window.onload = function () {
//     console.log(select.value); 
//     myChart = new Chart(ctx,config);
//     this.getAndUpdateDatas(myChart); 
// };

// select.onchange = function () { //works 
//     console.log(select.value);                                                                                                                                                                                                                                                              
//     getAndUpdateDatas(myChart); 
// }; 

// HELPER FOR CHART JS , from original documentation
//OLD not working properly 
// function addData(chart, label, data) {
//     chart.data.labels.push(label);
//     console.log(chart.data.datasets.length);
//     chart.data.datasets.forEach((dataset) => {
//         dataset.data.push(data);
//     });
// }
// function removeDatas(chart) {
//     for (var i=0; i<chart.data.labels; i++) {
//         chart.data.labels.pop();
//         chart.data.datasets.forEach((dataset) => {
//             dataset.data.pop();
//         });
//     }
// }


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

/*
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
})(); */