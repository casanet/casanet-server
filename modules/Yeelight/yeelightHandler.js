// Logger
var logger = require('../logs');

var GeneralMethods = require('../generalMethods');
var devices = require('../../DB/devices.json');

const Lookup = require("node-yeelight-wifi").Lookup;
let lookup = new Lookup();

// struc of all light obj map by its mac
//var lights = {};
var updateChangesCallbacks = [];

var UpdateDeviceByDeviceSelfUpdate = (deviceMac, state) => {

    var deviceMac = deviceMac.replace(/:/g, '');

    logger.write.info('yeelight device mac' + deviceMac + ' send update with state ' + state);
    updateChangesCallbacks.forEach((item) => {
        item(deviceMac, state);
    });
};

// Use to send update only if status realy changed
// map by device mac
var deviceObjCache = {};
// Registar to detect new light
lookup.on("detected", (light) => {

    // add device to map;
    deviceObjCache[light.mac] = light.power;

    logger.write.info('yeelight detected event arrive mac:' + light.mac);

    light.on("connected", () => {
        logger.write.info('yeelight connected event arrive');
        deviceObjCache[light.mac] == light.power;
        UpdateDeviceByDeviceSelfUpdate(light.mac, light.power ? 'on' : 'off');
    });

    light.on("disconnected", () => {
        logger.write.info('yeelight disconnected event arrive');
        UpdateDeviceByDeviceSelfUpdate(light.mac, 'error');
    });

    light.on("stateUpdate", (light) => {
        // if state not realy changed, skip
        // TODO  update also bright changes
        if (deviceObjCache[light.mac] == light.power)
            return;
        logger.write.info('yeelight stateUpdate event arrive');
        deviceObjCache[light.mac] = light.power;
        UpdateDeviceByDeviceSelfUpdate(light.mac, light.power ? 'on' : 'off');
    });
});

//////////////////////////////////
// Using miio protocoll
const miio = require('miio');

var ChangeState = (device, state, next) => {
    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (error) {
        next(error);
        return;
    }

    lightDevice.init()
        .then(() => {
            lightDevice.call('set_power', [state])
                .then((result) => {
                    next(result[0] == 'ok' ? null : 'Error');
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
};

var GetState = (device, next) => {
    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (error) {
        next('error', error);
        return;
    }

    lightDevice.init()
        .then(() => {
            lightDevice.call('get_prop', ['power'])
                .then((power) => {
                    next(power[0]);
                })
                .catch((err) => {
                    next('error', err);
                });
        })
        .catch((err) => {
            next('error', err);
        });
};

var GetBrightness = (device, next) => {
    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (error) {
        next('error', error);
        return;
    }

    lightDevice.init()
        .then(() => {
            lightDevice.call('get_prop', ['bright'])
                .then((bright) => {
                    next(parseInt(bright[0]));
                })
                .catch((err) => {
                    next('error', err);
                });
        })
        .catch((err) => {
            next('error', err);
        });
}

var SetBrightness = (device, value, next) => {
    if (device.brand == 'Yeelight' && device.state != 'on') {
        next('device must be turned on when values changed');
        return;
    }

    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (error) {
        next(error);
        return;
    }


    lightDevice.init()
        .then(() => {
            lightDevice.call('set_bright', [value])
                .then((res) => {
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
}

var GetColorTemperature = (device, next) => {

    // Light temp range
    var startRange = 1800;
    var endRange = 6500;

    if (device.model == 'Ceiling')
        startRange = 4100;

    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (err) {
        next('error', err);
        return;
    }

    lightDevice.init()
        .then(() => {
            // lightDevice.call('get_prop', ['rgb'])
            lightDevice.call('get_prop', ['ct'])
                .then((temperature) => {
                    next(GeneralMethods.SetRangeToPercent(parseInt(temperature[0]), startRange, endRange));
                })
                .catch((err) => {
                    next('error', err);
                });
        })
        .catch((err) => {
            next('error', err);
        });
}

var SetColorTemperature = (device, value, next) => {
    if (device.state != 'on') {
        next('device must be turned on when values changed');
        return;
    }

    var startRange = 1800;
    var endRange = 6500;

    if (device.model == 'Ceiling')
        startRange = 4100;

    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (error) {
        next(error);
        return;
    }

    lightDevice.init()
        .then(() => {
            value = GeneralMethods.GetRangeFromPercent(value, startRange, endRange);
            const args = Array.isArray(value) ? value : [value];
            args.push('smooth');
            args.push(500);

            lightDevice.call('set_ct_abx', args, {
                refresh: true
            })
                .then((res) => {
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
}

var GetRGB = (device, next) => {
    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (err) {
        next('error', err);
        return;
    }

    lightDevice.init()
        .then(() => {
            lightDevice.call('get_prop', ['rgb'])
                .then((rgb) => {
                    var value = IntToRgb(parseInt(rgb[0]));
                    next(value);
                })
                .catch((err) => {
                    next('error', err);
                });
        })
        .catch((err) => {
            next('error', err);
        });
}


var SetRGB = (device, value, next) => {
    if (device.state == 'off') {
        next('device must be turned on when values changed');
        return;
    }

    var lightDevice;
    try {
        lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });
    } catch (err) {
        next(err);
        return;
    }

    lightDevice.init()
        .then(() => {
            var rgbInt = RgbToInt(value);
            lightDevice.call('set_rgb', [rgbInt])
                .then((r) => {
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
}


// the RGB in yeelight is hold in one int var , with struct of 0x00RRGGBB
// so every color has 256 options (16 bits === 2 bytes when byte is 8 bits)
var IntToRgb = (theInt) => {
    var red = theInt;
    for (var i = 0; i < 16; i++) {
        red = parseInt(red / 2);
    }

    var green = theInt;
    for (var i = 0; i < 8; i++) {
        green = parseInt(green / 2);
    }
    green = green % (Math.pow(2, 8));


    var blue = theInt;
    blue = blue % (Math.pow(2, 8));

    return {
        red: red,
        green: green,
        blue: blue
    }
}

var RgbToInt = (color) => {
    return color.red * 65536 + color.green * 256 + color.blue
}

var UpdateChangesRegistar = function (callback) {
    updateChangesCallbacks.push(callback);
}

module.exports = {
    GetState: GetState,
    ChangeState: ChangeState,
    GetBrightness: GetBrightness,
    SetBrightness: SetBrightness,
    GetColorTemperature: GetColorTemperature,
    SetColorTemperature: SetColorTemperature,
    GetRGB: GetRGB,
    SetRGB: SetRGB,
    UpdateChangesRegistar: UpdateChangesRegistar
};