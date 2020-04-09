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
 // not working for the moment (check uint16_t port or int, String URL, args du http post)
  HttpClient http = HttpClient(wifiClient, IPServer, port);
  
  http.post(URL+"?id="+sensorId,"application/raw",timestamp+" "+value);
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("[HTTP] Status code: ");
  Serial.println(statusCode);
  Serial.print("[HTTP] Response: ");
  Serial.println(response);
  http.stop();
  
}