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
    }
}

module.exports = hbsHelpers;