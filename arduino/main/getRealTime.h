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

#include <RTCZero.h>
#include <WiFiNINA.h>


uint32_t setEpochFromNTP () ;

uint32_t getEpoch() ; 


//String formatTime (uint8_t num) ;
//uint32_t getEpochy2k () ;
