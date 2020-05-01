#include "arduino_secrets.h"
  /* Todo : séparer les .h et leur implémentation .cpp
  
  Low-power mode : https://www.arduino.cc/en/Reference/ArduinoLowPower 
  (éteindre module wifi etc ... )
  
  Try to use RTC de la microchip ATMEL // works 
  
*/
#include "connectWifi.h"
#include "httpPostSender.h"
//#include <ArduinoJson.h>
#include "getRealTime.h"
#include "SCD30Getter.h"
#include "uniqueId.h"

char ssid[] = SECRET_SSID;     // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
char IPServer[] = SECRET_IP; 
char URL[] = "/api/v0/receiver";
uint32_t epoch; 
uint16_t port = 3000; 
/*uint8_t id[16] ;
uint8_t * id2 ; 
char * id3;*/
String id;
//use external JSON librairy ? https://arduinojson.org/v6/doc/ or official arduino https://github.com/arduino-libraries/Arduino_JSON 
WiFiClient wifiClient;
byte mac[6];   

 // SENSORS 
const uint8_t nbSensor = 3;  // il faut que cela soit une constante pour stocker les ids dans un array
String ids[nbSensor] = {"no"}; 

// SCD30 part
uint16_t interval = 10;// (en secondes : de 2 à 1800, uint8_t ne va que jusqu'à 255 uint16_t jusqu'a 2^16-1)
float resultSCD[3] = {0};

void setup() {
  Wire.begin();
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    // todo remove ? 
  ; // wait for serial port to connect. Needed for native USB port only
  }
  connect_wifi(ssid,pass);  
  
  //possibilité : a partir de là, si erreur , envoyer à l'application un post spécial avec les informations de l'erreur ? 
  
  //WiFi.macAddress(mac);
  //UniqueIDdump(Serial);
  /* 
  MAC: 24:62:AB:B2:72:C8
UniqueID: F3 92 05 95 51 50 48 43 47 20 20 20 FF 13 2A 1F 
          f39205955150484347202020ff132a1f

  */
  setEpochFromNTP () ; 
  // reste marche, rtc seul du SAMD21!
  epoch = getEpoch(); 
  Serial.println(epoch); 
  id = getArduinoId(); 
  Serial.println(ids[0]); 
  Serial.println(ids[0]); 
  Serial.println(ids[0]); 
  
// A REVOIR 
  // ASK SERVER FOR NBSENSOR ID-S arg : (id) et array (temp,rh,co2?) ou gérer depuis l'appli? 
    // if there's already nb-sensors ids dans le document de ce sensorgroup 
    //break 
    // Qqch s'il y a déjà des sensors mais pas en quantité (nbsensors) pour cet Arduino ID ? 

    // renvoyer et sauvegarder l'arduino et ses capteurs ID-temp(-num) / ID-rh(-num) / ID-co2(-num) ? 

    // Arduino envoi son id a l'allumage, lui est retourné son nombre de sensor ? 
    // Add one sensor depuis l'appli ? Compliqué car comment le faire savoir à l'arduino? devrait demander à chaque loop, lourd.
    // 
/*
  idScdCo2 = id+"-1"; 
  idScdTemp = id+"-2";
  idScdRh = id+"-3";*/
  /*  
  getArduinoId (id) ; 
  Serial.println("/");
  Serial.println(id[1]);
  Serial.println("//");
  id2 = idIs(); 
  char charid[16]; 
//  id2.toCharArray(charid,16);
  Serial.println(castId2(id2));
  Serial.println("///");
  Serial.println((char *)id2); 
  Serial.println("////");
  castId(id,id3); 
  Serial.println(id3[1]);
  Serial.println("//////");
  Serial.println(id3); 
   Serial.println("///////");
  Serial.println(getArduinoId2());
  */
  
  // spécifique SCD 
  chooseIntervalAndStartPeriodicMeasurment (interval); 
}

void loop() {
  //String dateTime = getStringTime(UTC); // MAJ time a chaque loop, maintenant non nécessaire utiliser la RTC de la microchip
  epoch= getEpoch();
  Serial.println(epoch); 
  
  // todo processus d'enregistrement des capteurs
  // todo comment ensuite sait qu'il a X grandeurs et à envoyer à l'application 
  
  //send JSON data like "StoredData" MongooseModel option 1, works : send_JSON_post
  //option 2 : send text/pain avec notre convention , send_plain_post  , works 
  Serial.println(id); 
  // getting datas
  getValuesSCD30(resultSCD);
  
 // String JSONData = "{\"date\":\""+dateTime+"\",\"sensorId\":\"howtoAssign&getsensorId\",\"value\":\""+resultSCD[1]+"\"}";
  //send_JSON_post(wifiClient, IPServer,port,URL,JSONData);
  // todo send_plain_post(wifiClient,IPServer,port,URL,sensorId,timestamp,value) : retrouver le sensorId autrement! 

  for (uint8_t i=0;i<nbSensor;i++){
    // todo use generic for like this ? 
  }
  send_plain_post(wifiClient,IPServer,port,URL,id+"-1",(String)epoch,(String)resultSCD[0]);
  send_plain_post(wifiClient,IPServer,port,URL,id+"-2",(String)epoch,(String)resultSCD[1]);
  send_plain_post(wifiClient,IPServer,port,URL,id+"-3",(String)epoch,(String)resultSCD[2]);
  //send_plain_post(wifiClient,IPServer,port,URL,"e44a5322-78f1-40b9-946d-be9ad416679c",epoch,(String)resultSCD[1]);

  delay(interval*1000);
}
