#include <ArduinoHttpClient.h>
#include <SPI.h>
#include <WiFiNINA.h>

void send_plain_post (WiFiClient wifiClient, char * IPServer, uint16_t port, String URL, String arduinoId, String sensorId, String timestamp, String value) ;

void send_setup_informations (WiFiClient wifiClient, char * IPServer, uint16_t port, String URL, String groupId, String sensorIds[], uint8_t nbSensors);
