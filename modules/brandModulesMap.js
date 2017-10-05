var BroadLinkHandler = require('./Broadlink/broadlinkHandler');
var OrviboHandler = require('./Orvibo/orviboHandler');
var KankunHandler = require('./Kankun/kankunHandler');
var YeelightHandler = require('./Yeelight/yeelightHandler');
var PhilipsHandler = require('./Philips/philipsHandler');

// Map between brand name to his handler module
var GetBrandModule = (brand) => {
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
        // Add here a case of any module......
        default:
            return null;
    }
};


module.exports = {
    GetBrandModule: GetBrandModule,
}