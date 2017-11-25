// Logger
var logger = require('../logs');

var GeneralMethods = require('../generalMethods');
var devices = require('../../DB/devices.json');

const Lookup = require("node-yeelight-wifi").Lookup;
let lookup = new Lookup();

// struc of all light obj map by its mac
var lights = {};
var updateChangesCallbacks = [];

// Registar to detect new light
lookup.on("detected", (light) => {
    // Save obj
    lights[light.mac] = { power: light.power, obj: light };
    //console.log("new yeelight detected: id=" + light.id + " name=" + light.name);

    light.on("connected", () => {
        lights[light.mac] = { power: light.power, obj: light };

        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), light.power ? 'on' : 'off');
        });

        //console.log("connected");
    });

    light.on("disconnected", () => {
        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), 'error');
        });
        if (!(light.mac in lights))
            lights[light.mac].power = 'error';
    });

    light.on("stateUpdate", (light) => {

        // TODO: Not supprted yet changes in color and temp
        if (!(light.mac in lights) || lights[light.mac].power == light.power)
            return;

        lights[light.mac].power = light.power;

        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), light.power ? 'on' : 'off');
        });

        logger.debug('yeelight ' + light.mac + ' updated event sent');
    });
});

//////////////////////////////////
// Using miio protocoll
const miio = require('miio');

var ChangeState = (device, state, next) => {
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

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
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token, //'3d5f7ae53b51aa312e464b150b37453b',
        model: 'datamodel'
    });

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
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

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
    if (device.brand == 'Yeelight' && device.state == 'off') {
        next('device must be turned on when values changed');
        return;
    }

    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

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

    // Using node-yeelight-wifi insted of miio!!!
    // Light temp range
    var startRange = 1800;
    var endRange = 6500;

    var mac = GeneralMethods.ToReadbleMac(device.mac);
    // If this is ceiling change the temp range values
    if (mac in lights && lights[mac].obj.model == 'ceiling') {
        startRange = 4100;
        endRange = 6500;
    }


    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

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
    if (device.state == 'off') {
        next('device must be turned on when values changed');
        return;
    }

    // TODO temp if !!! need to reorder in code


    // Using node-yeelight-wifi insted of miio!!!
    mac = GeneralMethods.ToReadbleMac(device.mac);
    // If the light is a ceiling 
    if (mac in lights && lights[mac].obj.model == 'ceiling') {
        lights[mac].obj.setCT(GeneralMethods.GetRangeFromPercent(value, 4100, 6500)).then(() => {
            next();
        }).catch((error => {
            next(error);
        }));
    }
    else {
        const lightDevice = miio.createDevice({
            address: device.ip,
            token: device.token,
            model: 'datamodel'
        });

        lightDevice.init()
            .then(() => {
                value = GeneralMethods.GetRangeFromPercent(value, 1800, 6500);
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
}

var GetRGB = (device, next) => {
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

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

    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

    lightDevice.init()
        .then(() => {
            var rgbInt = RgbToInt(value);
            lightDevice.call('set_rgb', [rgbInt])
                .then((r) => {
                    next();
                })
                .catch((err) => {
                    next('error', err);
                });
        })
        .catch((err) => {
            next('error', err);
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