var BroadLinkHandler = require('./Broadlink/broadlinkHandler');
var OrviboHandler = require('./Orvibo/orviboHandler');
var KankunHandler = require('./Kankun/kankunHandler');
var YeelightHandler = require('./Yeelight/yeelightHandler');
var PhilipsHandler = require('./Philips/philipsHandler');

var devices = require('../DB/devices.json');

var GetFilterdKeysByType = function (typeToFilter) {
    var filterdKeysArray = [];
    Object.keys(devices).forEach((mac) => {
        if (devices[mac].types.indexOf(typeToFilter) != -1)
            filterdKeysArray.push(mac);
    })
    return filterdKeysArray;
};

// Map between brand name to his handler module
var GetBrandModule = function (brand) {
    switch (brand) {
        case 'Broadlink':
            return BroadLinkHandler;
        case 'Orvibo':
            return OrviboHandler;
        case 'Kankun':
            return KankunHandler;
        case 'Yeelight':
            return YeelightHandler;
        case 'Philips':
            return PhilipsHandler;
        default:
            return null;
    }
};


module.exports = {
    GetBrandModule: GetBrandModule,
    GetFilterdKeysByType: GetFilterdKeysByType
}