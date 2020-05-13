/* Main sans commentaires, pour voir les commentaires et choses à faire voir main_V0 */ 
#include "arduino_secrets.h"
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
 // GROUP SENSOR & SENSORS INFORMATION  - USER input ? Coder en dur ? 
 
const uint8_t nbSensor = 3;  // const to store datatype in array 
String dtypes[nbSensor] = {"temp", "rh","co2"};
String timezone= "America/Toronto"; 

/**************************************************************/
// SCD30 part
uint16_t interval = 10;// (en secondes : de 2 à 1800, uint8_t ne va que jusqu'à 255 uint16_t jusqu'a 2^16-1)
float resultSCD[3] = {0};

/**************************************************************/
/*                   SETUP                                    */
/**************************************************************/
void setup() {

  /******* Initialization *******/
  Wire.begin();
  //Initialize serial and wait for port to open:
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
  send_setup_informations(wifiClient,IPServer, port, URL, id, "grouptest", timezone, dtypes, nbSensor); 
  
  /******* Setup for specific group sensor *******/ 
  chooseIntervalAndStartPeriodicMeasurment (interval); 
}

/**************************************************************/
/*                     LOOP                                   */
/**************************************************************/
void loop() {

 /******* Get time (RTC Arduino) *******/
  epoch= getEpoch();
 
 /******* Getting datas from sensors *******/ 
  getValuesSCD30(resultSCD);

 /******* Sending sensors datas to application *******/ 
  send_plain_post(wifiClient,IPServer,port,URL,id+"-co2",(String)epoch,(String)resultSCD[0]);
  send_plain_post(wifiClient,IPServer,port,URL,id+"-temp",(String)epoch,(String)resultSCD[1]);
  send_plain_post(wifiClient,IPServer,port,URL,id+"-rh",(String)epoch,(String)resultSCD[2]);

  /******* Waiting 10 seconds *******/ 
  delay(interval*1000);
}
