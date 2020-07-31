#include <SCD30.h>

void chooseIntervalAndStartPeriodicMeasurment (uint16_t interval) ;

// Rempli l'array passé en argument avec les valeurs mesurées de co2 / Température / Humidité dans cette ordre 
// retourne 1 en cas de réussite, 0 en cas d'échec de récupération des valeurs 
uint8_t getValuesSCD30 (float * result) ;
