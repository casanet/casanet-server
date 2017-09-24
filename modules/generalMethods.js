
// 4a8926c44578 to 4a:89:26:c4:45:78
var ToReadbleMac = function (mac) {
    return mac.toString(16)             // "4a8926c44578"
        .match(/.{1,2}/g)    //  // ["78", "45", "c4", "26", "89", "4a"]
        .join(':')
}

// For example get 150 for value 50 with min 100 max 200 or get 200 for 50 with min 100 max 300 
var GetRangeFromPercent = function(value, minRange, maxRange){
    var range = maxRange - minRange;
    var factor = range / 100;
    return (value * factor) + minRange;
}

// For example get 50 for value 150 with min 100 max 200 or get 50 for 200 with min 100 max 300 
var SetRangeToPercent = function(value, minRange, maxRange){
    var range = maxRange - minRange;
    var factor = range / 100;
    return ((value - minRange) / factor);
}

module.exports = {
    ToReadbleMac : ToReadbleMac,
    GetRangeFromPercent, GetRangeFromPercent,
    SetRangeToPercent, SetRangeToPercent
}