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

//#include <SPI.h>
//#include <WiFiUdp.h>
#include <RTCZero.h>

RTCZero rtc;

String formatTime (uint8_t num) {
  String res;
  if (num < 10) {
    res = "0"+(String)num;
  }
  else {
    res = (String)num; 
  }
  return res;
}

String getStringTime (int GMT) {
  RTCZero rtc;
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
    //while (1);
  }
  else {
    Serial.print("Epoch received: ");
    Serial.println(epoch);
    rtc.setEpoch(epoch);
    Serial.println();
  }
  
  Serial.println();
 // delay(1000);
  String hour = formatTime(rtc.getHours() + GMT) ;
  String minutes = formatTime(rtc.getMinutes());
  String seconds = formatTime(rtc.getSeconds());
  return (String)rtc.getDay() +"/"+(String)rtc.getMonth() +"/"+ (String)rtc.getYear()+ " "+hour+":"+minutes+":"+seconds;
}