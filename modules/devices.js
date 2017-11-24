// Logger
var logger = require('./logs');

var shortid = require('shortid');

var brandModulesMap = require('./brandModulesMap');
var YeelightHandler = require('./Yeelight/yeelightHandler');

var devices = require('../DB/devices.json');
var devicesKeysArray = [];

Object.keys(devices).forEach((id) => {
    devicesKeysArray.push(id);
})

// Recursive function to run on every dd\evie 
// not in parallel
// (because some of devices cant work together)
var InitDevicesData = function (deviceIndex, next) {
    // recursive stop condition
    if (deviceIndex >= devicesKeysArray.length) {
        next()
        return;
    }

    var id = devicesKeysArray[deviceIndex];
    var device = devices[id];

    var brandModuleHandler = brandModulesMap.GetBrandModule(device.brand);

    if (brandModuleHandler == null) {
        logger.error('Cant find module that map to brand: ' + device.brand)
        next('Cant find module that map to brand: ' + device.brand);
        return;
    }


    // Get every device property value by recursion
    var getDeviceProperty = (propertyIndex) => {
        // If finish get current device properties go to next device
        if (propertyIndex >= device.types.length) {
            InitDevicesData(deviceIndex + 1, next);
            return
        }

        switch (device.types[propertyIndex]) {
            case ('switch'):
                brandModuleHandler.GetState(device, (state, err) => {
                    device.state = state;
                    logger.info('Device ' + device.name + ' status ' + state);
                    if(err){
                        logger.error('Device ' + device.name + ' while get -switch- has ' + err);
                        device.state = 'error';
                    }
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            case ('light'):
                brandModuleHandler.GetBrightness(device, (value, err) => {
                    device.bright = value;
                    logger.info('Device ' + device.name + ' bright ' + value);
                    if(err){
                        logger.error('Device ' + device.name + ' while get -light- has ' + err);
                        device.state = 'error';
                    }
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            case ('white_temp'):
                brandModuleHandler.GetColorTemperature(device, (value, err) => {
                    device.white_temp = value;
                    logger.info('Device ' + device.name + ' white_temp ' + value);
                    if(err){
                        logger.error('Device ' + device.name + ' while get -white_temp- has ' + err);
                        device.state = 'error';
                    }
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            case ('light_color'):
                brandModuleHandler.GetRGB(device, (value, err) => {
                    device.light_color = value;
                    logger.info('Device ' + device.name + ' light_color R:' + value.red + ' G:' + value.green + ' B:' + value.blue);
                    if(err){
                        logger.error('Device ' + device.name + ' while get -light_color- has ' + err);
                        device.state = 'error';
                    }
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            case ('ac'):
                brandModuleHandler.GetACData(device, (value, err) => {
                    device.ac = value;
                    logger.info('Device ' + device.name + " value: mode -" + value.mode + "- fan_strength: -" + value.fan_strength + "- temp:" + value.temp);
                    if(err){
                        logger.error('Device ' + device.name + ' while get -a- has ' + err);
                        device.state = 'error';
                    }
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            // Here extenad types getting
            default:
                logger.error('Cant handle unknown type: ' + device.types[propertyIndex]);
                next('Cant handle unknown type: ' + device.types[propertyIndex])
                return;
        }
    }
    // Start getting device properties
    getDeviceProperty(0);
}


// next =  (err)
var SetDeviceProperty = (id, type, value, next) => {
    var device = devices[id];

    if (!device) {
        logger.warn('Cant find device with id: ' + id);
        next('Cant find device with id: ' + id);
        return;
    } else if (device.types.indexOf(type) == -1) {
        logger.warn('Device id: ' + id + ' not supported : ' + type);
        next('Device id: ' + id + ' not supported : ' + type);
        return;
    }
    var brandModuleHandler = brandModulesMap.GetBrandModule(device.brand);

    if (brandModuleHandler == null) {
        logger.error('Cant find module that map to brand: ' + device.brand);
        next('Cant find module that map to brand: ' + device.brand);
        return;
    }

    // Do type action 
    switch (type) {
        case ('switch'):
            brandModuleHandler.ChangeState(device, value, (err) => {
                if (err) {
                    logger.warn(type + ' request not executed, error : ' + err);
                    next(err);
                } else {
                    logger.info(device.name + ' set ' + type + ' to ' + value);
                    device.state = value;
                    next();
                    PushChanges(id);
                }
            });
            break;
        case ('light'):
            brandModuleHandler.SetBrightness(device, value, (err) => {
                if (err) {
                    logger.warn(type + ' request not executed, error : ' + err);
                    next(err);
                } else {
                    logger.info(device.name + ' set ' + type + ' to ' + value);
                    device.bright = value;
                    device.state = 'on';
                    next();
                    PushChanges(id);
                }
            });
            break;
        case ('white_temp'):
            brandModuleHandler.SetColorTemperature(device, value, (err) => {
                if (err) {
                    logger.warn(type + ' request not executed, error : ' + err);
                    next(err);
                } else {
                    logger.info(device.name + ' set ' + type + ' to ' + value);
                    device.white_temp = value;
                    device.state = 'on';
                    next();
                    PushChanges(id);
                }
            });
            break;
        case ('light_color'):
            brandModuleHandler.SetRGB(device, value, (err) => {
                if (err) {
                    logger.warn(type + ' request not executed, error : ' + err);
                    next(err);
                } else {
                    logger.info('Device ' + device.name + 'set light_color R:' + value.red + ' G:' + value.green + ' B:' + value.blue);
                    device.light_color = value;
                    device.state = 'on';
                    next();
                    PushChanges(id);
                }
            });
            break;
        case ('ac'):
            brandModuleHandler.SetACData(device, value, (err) => {
                if (err) {
                    logger.warn(type + ' request not executed, error : ' + err);
                    next(err);
                } else {
                    logger.info(device.name + "set value: mode -" + value.mode + "- fan_strength: -" + value.fan_strength + "- temp:" + value.temp);
                    device.ac = value;
                    device.state = 'on';
                    next();
                    PushChanges(id);
                }
            });
            break;
        // Here add your new type 
        default:
            logger.warn('Cant handle unknown type: ' + type);
            next('Cant handle unknown type: ' + type)
            return;
    }
};

// next = (device, err)
var GetDevice = (id, next) => {
    next(devices[id]);
};

// next = (devices, err)
var GetDevices = (next) => {
    next(devices);
};

// Scan lan devices data one by one
// next = (err)
var RefreshDevicesData = (next) => {
    logger.info('Start rescan all LAN devices')
    InitDevicesData(0, next);
};

// In startup of server scan all lan devices
logger.info('Getting devices data...');
RefreshDevicesData((err) => {
    logger.info('Done getting device data');
    if (err)
        logger.error(err);
});

// Push changes events

// callbacks to invoke when event happend
var updateCallbacks = [];

// Update changes in array of switchers 
// and invoke event to registars mathods 
var PushChanges = (id) => {
    updateCallbacks.forEach((registardMethod) => {
        registardMethod(id, devices[id]);
    })
};

// Let registar to change state event
var UpdateChangesEventRegistar = function (callback) {
    updateCallbacks.push(callback);
}

// registar to yeelight events
YeelightHandler.UpdateChangesRegistar((mac, newState) => {
    devicesKeysArray.forEach((id) => {
        if (devices[id].mac == mac) {
            devices[id].state = newState;
            PushChanges(id);
            return;
        }
    });
})

// comments, sse, events, 
module.exports = {
    SetDeviceProperty: SetDeviceProperty,
    GetDevice: GetDevice,
    GetDevices: GetDevices,
    RefreshDevicesData: RefreshDevicesData,
    UpdateChangesEventRegistar: UpdateChangesEventRegistar
};