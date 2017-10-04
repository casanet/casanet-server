var BroadLinkHandler = require('./Broadlink/broadlinkHandler');
var OrviboHandler = require('./Orvibo/orviboHandler');
var KankunHandler = require('./Kankun/kankunHandler');
var YeelightHandler = require('./Yeelight/yeelightHandler');
var PhilipsHandler = require('./Philips/philipsHandler');

var devices = require('../DB/devices.json');

// Get name of type to filter by, or null to get all devices keys 
var GetFilterdKeysByType = function (typeToFilter) {
    var filterdKeysArray = [];
    Object.keys(devices).forEach((id) => {
        if (!typeToFilter ||
            devices[id].types.indexOf(typeToFilter) != -1)
            filterdKeysArray.push(id);
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
    Devices : devices,
    GetBrandModule: GetBrandModule,
    GetFilterdKeysByType: GetFilterdKeysByType
}