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
                    console.log('Device ' + device.name + ' status ' + state);
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            case ('light'):
                brandModuleHandler.GetBrightnessAndColor(device, (value, err) => {
                    device.light = value;
                    console.log('Device ' + device.name + ' value: bright ' + value.bright + ' color ' + value.color);
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            case ('ac'):
                brandModuleHandler.GetACData(device, (value, err) => {
                    device.ac = value;
                    console.log('Device ' + device.name + " value: mode -" + value.mode + "- fan_strength: -" + value.fan_strength + "- temp:" + value.temp);
                    getDeviceProperty(propertyIndex + 1);
                });
                return;
            // Here extenad types getting
            default:
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
        next('Cant find device with id: ' + id);
        return;
    } else if (device.types.indexOf(type) == -1) {
        next('Device id: ' + id + ' not supported : ' + type);
        return;
    }
    var brandModuleHandler = brandModulesMap.GetBrandModule(device.brand);

    if (brandModuleHandler == null) {
        next('Cant find module that map to brand: ' + device.brand);
        return;
    }

    // Do type action 
    switch (type) {
        case ('switch'):
            brandModuleHandler.ChangeState(device, value, (err) => {
                if (err)
                    next(err);
                else {
                    device.state = value;
                    next();
                    PushChanges(id);
                }
            });
            break;
        case ('light'):
            brandModuleHandler.SetBrightnessAndColor(device, value, (err) => {
                if (err)
                    next(err);
                else {
                    device.light = value;
                    next();
                    PushChanges(id);
                }
            });
            break;
        case ('ac'):
            brandModuleHandler.SetACData(device, value, (err) => {
                if (err)
                    next(err);
                else {
                    device.ac = value;
                    next();
                    PushChanges(id);
                }
            });
            break;
        // Here add your new type 
        default:
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
    InitDevicesData(0, next);
};

// In startup of server scan all lan devices
console.log('Getting devices data...');
RefreshDevicesData((err) => {
    console.log('Done getting device data');
    if (err)
        console.error(err);
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
    console.log('Update-feed send for device ' + id);
};

// Let registar to change state event
var UpdateChangesEventRegistar = function (callback) {
    updateCallbacks.push(callback);
}

// registar to yeelight events
YeelightHandler.UpdateChangesRegistar((mac, newState) => {
    devicesKeysArray.forEach((id) => {
        if(devices[id].mac == mac){
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