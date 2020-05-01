let hbsHelpers = {
    inc: function(value, options) {
        console.log('reading it');
        return parseInt(value) + 1;
    },
    toJSON: function(object) {
        return JSON.stringify(object);
    },
    ifEquals: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    cutAbrev: function(datatype) {
        switch(datatype) {
            case 'temp':
              return 'Température'; 
            case 'rh':
                return 'Humidité relative'; 
            case 'co2':
                return 'CO2'; 
            default:
                return datatype; 
          } 
    },
    unit: function(datatype) {
        switch(datatype) {
            case 'temp':
              return '°C'; 
            case 'rh':
                return '%'; 
            case 'co2':
                return 'ppm'; 
            default:
                return ''; 
          } 
    }
}

module.exports = hbsHelpers;