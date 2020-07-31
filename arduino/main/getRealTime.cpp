/*
  MKR1000 - MKR WiFi 1010 - MKR VIDOR 4000 WiFi RTC
  This sketch asks NTP for the Linux epoch and sets the internal Arduino MKR1000's RTC accordingly.
  created 08 Jan 2016
  by Arturo Guadalupi <a.guadalupi@arduino.cc>
  modified 26 Sept 2018

  http://arduino.cc/en/Tutorial/WiFiRTC
  This code is in the public domain.
  
  + ajout de modifications personnelles
*/

#include "getRealTime.h"


RTCZero rtc;

uint32_t setEpochFromNTP () {
  rtc.begin(); 
  
  unsigned long epoch;
  int numberOfTries = 0, maxTries = 6;
  do {
    epoch = WiFi.getTime();
    numberOfTries++;
  }
  while ((epoch == 0) && (numberOfTries < maxTries));

  if (numberOfTries == maxTries) {
    Serial.print("ERROR : NTP (Network Time Protocol) unreachable!!");
  }
  else {
    Serial.print("Epoch received: ");
    Serial.println(epoch);
    rtc.setEpoch(epoch);
  }
  return epoch; 
}

uint32_t getEpoch() {
return rtc.getEpoch();
}



/*String formatTime (uint8_t num) {
  String res;
  if (num < 10) {
    res = "0"+(String)num;
  }
  else {
    res = (String)num; 
  }
  return res;
}*/

/*uint32_t getEpochy2k () {
  return rtc.getY2kEpoch();
}*/
