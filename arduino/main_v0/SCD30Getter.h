#include "SCD30.h"

void chooseIntervalAndStartPeriodicMeasurment (uint16_t interval) {
  Serial.println("debug"+interval);
  scd30.setMeasurementInterval(interval); // in seconds [2...1800] ,mesure au 10 secondes, overwrite si pas récupérée entre temps
  Serial.println("debug0");
  scd30.startPeriodicMeasurment(); 
  Serial.println("Debug1");
  
}

// Retourne un array des valeurs mesurées de co2 / Température / Humidité dans cette ordre 
void getValuesSCD30 (float * result) {
  if (scd30.isAvailable()) { // readRegister(SCD30_GET_DATA_READY);
    scd30.getCarbonDioxideConcentration(result); //   writeCommand(SCD30_READ_MEASUREMENT); lit la lecture 
   /*Serial.print("Carbon Dioxide Concentration is: ");
    Serial.print(result[0]);
    Serial.println(" ppm");
    Serial.println(" ");
    Serial.print("Temperature = ");
    Serial.print(result[1]);
    Serial.println(" ℃");
    Serial.println(" ");
    Serial.print("Humidity = ");
    Serial.print(result[2]);
    Serial.println(" %");
    Serial.println(" ");
    Serial.println(" ");
    Serial.println(" "); */
  }
  else {
    Serial.print("Sensor data buffer empty that time");
  }
}