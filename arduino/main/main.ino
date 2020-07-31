#include <SPI.h>

#include "arduino_secrets.h"
/* Main sans commentaires, pour voir les commentaires et choses à faire voir main_V0 */ 
#include "connectWifi.h"
#include "httpPostSender.h"
//#include <ArduinoJson.h> //necessary if we want to send datatypes Array in JSON format or to be sure of the fields sent
#include "getRealTime.h"
#include "SCD30Getter.h"
#include "uniqueId.h"

/**************************************************************/
/*                      VARIABLES                             */
/**************************************************************/
char ssid[] = SECRET_SSID;     
char pass[] = SECRET_PASS;    
char IPServer[] = SECRET_IP; 

char URL[] = "/api/v0"; // Api URL
uint16_t port = 3000; // Application port 

uint32_t epoch; // to store UNIX time
String id;  // to store Arduino unique ID 

WiFiClient wifiClient; 

/**************************************************************/
 // GROUP SENSOR & SENSORS INFORMATION  

 /*************************************************************************************************************************************************************/ 
 /*  Renseignez ici le nombre de métriques qui seront récoltés par l'Arduino et envoyées au serveur (nombre de capteurs connectés à cet Arduino : 1,2,3,4...  */ 
 /*************************************************************************************************************************************************************/
const uint8_t nbSensor = 3; 
 /*****************************************************************************************************************************************************************/ 
 /*   Renseignez ici un identifiant unique, sans espace, pour chacune des métriques/capteurs DANS LE MEME ORDRE D'ENVOI au serveur (commande en fin de programme) */
 /*   Il doit y avoir exactement le même nombre d'identifiant unique que le nombre précédemment renseigné                                                         */
 /*   ATTENTION, une fois ces identifiants choisis et correctement enregistrés par le serveur, vous ne devrez plus les modifier                                   */ 
 /*****************************************************************************************************************************************************************/
String sensIds[nbSensor] = {"co2", "temp","rh"};
 /*********************************************************************************************************************************************************************/ 
 /*  Renseignez ici la timezone où se trouve l'Arduino collectant les données, actuellement l'application prend en cahrge "America/Toronto" (Québec) et "Europe/Paris" */ 
 /**********************************************************************************************************************************************************************/
String timezone= "America/Toronto"; 

/**************************************************************/
// PARTIE SPECIFIQUE AU PARAMETRAGE DES CAPTEURS EN EUX-MEMES (suivre la datasheet du dispositif)
// SCD30 (capteurs collectant CO2, Température de l'air et humidité relative de l'air) 

// Interval de collecte des données par le capteur (choix actuel : chaque 30 secondes) 
uint16_t interval = 30; // (en secondes : de 2 à 1800) 
// Variables qui récoltera les données (3 pour le SCD30 dans l'ordre : co2,température,humidité)
float resultSCD[3] = {0};

/**********************************************************************/
/*                   SETUP  FUNCTION                                  */
/**********************************************************************/
void setup() {

  /******* Initialization *******/
  Wire.begin();
  //Initialize serial and wait for port to open:
 
/******************************************************************************************************/ 
/*  Commentez les 4 lignes suivantes si vous connectez l'Arduino a une autre source qu'un ordinateur */ 
/*****************************************************************************************************/
   Serial.begin(9600);
  while (!Serial) {
  ; // wait for serial port to connect. Needed for native USB port only
  }
  
  /******* Connect to WiFI *******/
  connect_wifi(ssid,pass);  

  /******* Setup time *******/
  setEpochFromNTP () ; 
  epoch = getEpoch(); 

  /******* Get unique ID *******/
  id = getArduinoId(); 
  
  /******* Send Arduino informations to the application *******/
  send_setup_informations(wifiClient,IPServer, port, URL, id, sensIds, nbSensor); 
  
  /******* Setup for specific sensor *******/ 
  chooseIntervalAndStartPeriodicMeasurment (interval); 
}

/**************************************************************/
/*                     LOOP                                   */
/**************************************************************/
void loop() {

 /******* Get time (RTC Arduino) *******/
  epoch= getEpoch();
 
 /******* Getting datas from sensors *******/ 
  uint8_t ans = getValuesSCD30(resultSCD);

 /******* Sending sensors datas to application *******/ 
 // SCD en ordre : 0 CO2, 1 température, 2 humidité relative

 /*********************************************************************************************************************************************************************/ 
 /*  Renseignez ici les bonnes valeurs à envoyer à l'application : 5eme argument "arduinoid/sensorid", 7eme/dernier argument : la valeur mesurée de ce capteur        */ 
 /*  L'utilisation d'une boucle for n'est pas nécessaire (elle se prête à la seule utilisation du SCD30)                                                              */
 /**********************************************************************************************************************************************************************/
  if (ans == 1) {
    for (int i=0; i<nbSensor ; i++) {
      send_plain_post(wifiClient,IPServer,port,URL,id,(String)sensIds[i],(String)epoch,(String)resultSCD[i]);
    }
  }

 /* send_plain_post(wifiClient,IPServer,port,URL,id+"/co2",(String)epoch,(String)resultSCD[0]);
  send_plain_post(wifiClient,IPServer,port,URL,id+"/temp",(String)epoch,(String)resultSCD[1]);
  send_plain_post(wifiClient,IPServer,port,URL,id+"/rh",(String)epoch,(String)resultSCD[2]);
*/
  /******* Waiting "interval" seconds *******/ 
  delay(interval*1000);
}
