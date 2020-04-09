/*
*/
#include "connectWifi.h"
#include "httpPostSender.h"
//#include <ArduinoJson.h>
#include "getRealTime.h"
#include "SCD30Getter.h"

char ssid[] = SECRET_SSID;     // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
char IPServer[] = SECRET_IP; 
char URL[] = "/api/v0/test";
uint16_t port = 3000; 
//use external JSON librairy ? https://arduinojson.org/v6/doc/ or official arduino https://github.com/arduino-libraries/Arduino_JSON 
const int GMT = -4; // Mettre le GMT de la zone de l'Arduino (-4 Montréal, +2 Paris)
WiFiClient wifiClient;

uint16_t interval = 10;// (en secondes : de 2 à 1800, uint8_t ne va que jusqu'à 255 uint16_t jusqu'a 2^16-1)
float resultSCD[3] = {0};

void setup() {
  Wire.begin();
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
  ; // wait for serial port to connect. Needed for native USB port only
  }
  connect_wifi(ssid,pass);
  chooseIntervalAndStartPeriodicMeasurment (interval); 
  Serial.println("Debug2");
}

void loop() {
  String dateTime = getStringTime(GMT); // time MAJ a chaque loop; mettre en place avec une horloge temps réel plus tard 
  // todo processus d'enregistrement des capteurs
  // todo recupérer les datas du vrai SCD 
  // Deal with datas in the application : store with the right sensorID 
  //send JSON data like "StoredData" MongooseModel 
  getValuesSCD30(resultSCD);
  String JSONData = "{\"date\":\""+dateTime+"\",\"sensorId\":\"howtoAssign&getsensorId\",\"value\":\""+resultSCD[1]+"\"}";
 
  send_JSON_post(wifiClient, IPServer,port,URL,JSONData);
  // todo send_plain_post(wifiClient,IPServer,port,URL,sensorId,timestamp,value)
  //send_plain_post(wifiClient,IPServer,port,URL,"e44a5322-78f1-40b9-946d-be9ad416679c",dateTime,(String)resultSCD[1]);

  delay(interval*1000);
}
