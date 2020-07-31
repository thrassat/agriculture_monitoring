#include "uniqueId.h"

// recupére correctement l'unique id
String getArduinoId () {
  String res = ""; 
  for (size_t i = 0; i < 16; i++) {
    if (UniqueID[i] < 0x10) {
        Serial.print("0");
        res= res+'0'; 
    }
    Serial.print(UniqueID[i], HEX); 
    res = res + String(UniqueID[i],HEX);
  }
  return res;
}
/*
void getArduinoId3 (uint8_t id[]) {
  for (size_t i = 0; i < UniqueIDsize; i++) {
    if (UniqueID[i] < 0x10)  
      Serial.print("0");
      id[i]='0';
    Serial.print(UniqueID[i], HEX); 
    id[i]=UniqueID[i];
  }
}

String getArduinoId2 () {
  String res = ""; 
  for (size_t i = 0; i < UniqueIDsize; i++) {
    if (UniqueID[i] < 0x10)  
      Serial.print("0");
      res= res+'0';
    Serial.print(UniqueID[i], HEX); 
    res = res + String(UniqueID[i],HEX);
  }
  return res;
}

uint8_t * idIs () {
  return UniqueID;
}

void castId (char * res) {
  for (uint8_t i=0; i<16;i++) {
    res[i] = char(UniqueID[i]);
  }
}

String castId2 (uint8_t id[]) {
  String res; 
  for (uint8_t i=0; i<16;i++) {
    res = res + String(id[i],HEX);
    Serial.print(String(id[i],HEX)+"kkkk");
  }
  return res; 
}*/
