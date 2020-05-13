#include <ArduinoHttpClient.h>
#include <SPI.h>
//char server
//WiFiClient wifiClient,  add arg ?

void send_JSON_post (WiFiClient wifiClient, char * IPServer, int port, char * URL, String JSONdata) {
  HttpClient http = HttpClient(wifiClient, IPServer, port);
  Serial.println("Sending post request to :");
  Serial.print(IPServer);https://create.arduino.cc/
  Serial.print(":");
  Serial.print(port);
  Serial.println(URL);
  // Do proper concatenation and space memory allocation? https://stackoverflow.com/questions/1995053/const-char-concatenation
  //Todo use arduino json print data that will be sent
  http.post(URL, "application/json", JSONdata);  // return 0 if successful, else error 
  // read the status code and body of the response
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("[HTTP] Status code: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Response: ");
  Serial.println(response);
  http.stop();
}

void send_plain_post(WiFiClient wifiClient, char * IPServer, uint16_t port, String URL, String sensorId, String timestamp, String value) {
 // todo try to remove "String" 
 // IPServer peut-être de type : char *, String, IPAddress
  HttpClient http = HttpClient(wifiClient, IPServer, port);

  // Args : URLPath (char * ou String) , ContentType (char * ou String), Body (char *, String, byte[])
  http.post(URL+"/reveiver/"+sensorId,"text/plain",timestamp+" "+value);
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("[HTTP] Status code: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Response: ");
  Serial.println(response);
  http.stop();
}


void send_setup_informations (WiFiClient wifiClient, char * IPServer, uint16_t port, String URL, String groupId, String groupName, String timezone, String types[], uint8_t nbSensors) {
  // use json lib pour passer les types ? 
  // ou bien envoyer du plain type id-name-type1-type2.... 
  // two way to get type array length : 
  // * passer nb sensor comme argument : présent dans le code arduino (3) 
  // * sizeof(types) : en bytes, multiple de 12 d'après le test (sizeof(types[i])) toujours 12
  // Ici sizeof(types) retourne directement la bonne length 
  Serial.println(sizeof(types)); 
  
  String typeString = ""; 
//  Serial.println(typeSize) ; 
  for(int i=0; i<nbSensors;i++){
    Serial.println(types[i]); 
    typeString = typeString+"-"+types[i]; 
  }
  Serial.println(typeString); 
  // String JSONData = "{\"groupid\":\""+groupId+"\",\"groupName\":\""+groupName+"\",\"types\":\""+types+"\"}";
  // Issue with type : need to use JSON library or alternatives like sending plain text : 
  // todo : sensorgroup name = user input ? Ajouté depuis l'application? Si envoyé ici exclure le tiret possible dans le name 
  String plainText = groupId+"-"+groupName+"-"+timezone+typeString; 
  Serial.println(plainText) ; 
  
  HttpClient http = HttpClient(wifiClient, IPServer, port); 
  http.post(URL+"/groupsetup","text/plain", plainText); 
    int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("[HTTP] Status code: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Response: ");
  Serial.println(response);
  http.stop(); 
} 
