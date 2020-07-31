#include "httpPostSender.h"

void send_plain_post (WiFiClient wifiClient, char * IPServer, uint16_t port, String URL, String arduinoId, String sensorId, String timestamp, String value) {
 // todo try to remove "String" 
 // IPServer peut-être de type : char *, String, IPAddress
  HttpClient http = HttpClient(wifiClient, IPServer, port);

  // Args : URLPath (char * ou String) , ContentType (char * ou String), Body (char *, String, byte[])
  //Application attend "receiver/arduinouniqueid/sensorid" . body : "epoch valeur" 
  
  http.post(URL+"/receiver/"+arduinoId+"/"+sensorId,"text/plain",timestamp+" "+value);
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("[HTTP] Status code: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Response: ");
  Serial.println(response);
  http.stop();
}


void send_setup_informations (WiFiClient wifiClient, char * IPServer, uint16_t port, String URL, String groupId, String sensorIds[], uint8_t nbSensors) {
  // two way to get sensorIds array length : 
  // * passer nb sensor comme argument : présent dans le code arduino (3) 
  // * sizeof(sensorIds) : en bytes, multiple de 12 d'après le test (sizeof(sensorIds[i])) toujours 12
  // Ici sizeof(sensorIds) retourne directement la bonne length 
  
  String typeString = ""; 
  for(int i=0; i<nbSensors;i++){
    typeString = typeString+"-"+sensorIds[i]; 
  }

  // plain text type : arduinoUniqueId-sensorId1-sensorId2-sensorId3 
  String plainText = groupId+typeString ; 

  HttpClient http = HttpClient(wifiClient, IPServer, port); 
  http.post(URL+"/ardSetup","text/plain", plainText); 
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("[HTTP] Status code: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Response: ");
  Serial.println(response);
  http.stop(); 
} 
