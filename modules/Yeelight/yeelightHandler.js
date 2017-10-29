var GeneralMethods = require('../generalMethods');
var devices = require('../../DB/devices.json');

const Lookup = require("node-yeelight-wifi").Lookup;
let lookup = new Lookup();

// struc of all light obj map by its mac
var lights = {};
updateChangesCallbacks = [];

// Registar to detect new light
lookup.on("detected", (light) => {
    // Save obj
    lights[light.mac] = { power: light.power, obj: light };
    //console.log("new yeelight detected: id=" + light.id + " name=" + light.name);

    light.on("connected", () => {
        lights[light.mac] = { power: light.power, obj: light };

        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), light.power? 'on' : 'off');
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

        console.log('yeelight ' + light.mac + ' updated event sent');
    });
});

//////////////////////////////////
// Using miio protocoll like philips 
const miio = require('miio');

var miioLights = {};
var ChangeState = function (device, state, next) {
    if (!(device.mac in miioLights)) {
        next('Mac not exsist in module lights');
        return;
    }

    miioLights[device.mac].call('set_power', [state])
        .then((result) => {
            next(result[0] == 'ok' ? null : 'Error');
        })
        .catch((err) => {
            next(err);
        });
};

var GetState = function (device, next) {
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token, //'3d5f7ae53b51aa312e464b150b37453b',
        model: device.mac
    });

    lightDevice.init()
        .then(() => {
            miioLights[device.mac] = lightDevice;
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

var GetBrightnessAndColor = function (device, next) {
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: device.mac
    });

    lightDevice.init()
        .then(() => {
            miioLights[device.mac] = lightDevice;
            lightDevice.call('get_prop', ['bright'])
                .then((bright) => {
                    lightDevice.call('get_prop', ['ct'])
                        .then((cct) => {
                            next({ bright: parseInt(bright[0]), color: GeneralMethods.SetRangeToPercent(parseInt(cct[0]), 4100, 6500) });
                        })
                        .catch((err) => {
                            next({ bright: -1, color: -1 }, err);
                        });
                })
                .catch((err) => {
                    next({ bright: -1, color: -1 }, err);
                });
        })
        .catch((err) => {
            next({ bright: -1, color: -1 }, err);
        });
}

// var SetBrightnessAndColor = function (ip, mac, value, next) {
//     if (!(mac in lights)) {
//         next(false);
//         return;
//     }

//     lights[mac].call('set_bricct', [value.bright, value.color])
//         .then((result) => {
//             console.log('philips light bricct ' + mac + ' set successfuly');
//             next(result[0] == 'ok' ? true : false);
//         })
//         .catch((err) => {
//             next(false);
//         });

// }

/////////////////////////////////
/// using node-yeelight-wifi

// var ChangeState = function (ip, mac, state, next) {
//     mac = GeneralMethods.ToReadbleMac(mac);
//     if (mac in lights) {
//         lights[mac].obj.setPower(state).then(() => {
//             next(true);
//         }).catch((error => {
//             next(false);
//         }));
//     }
//     else {
//         next(false);
//     }
// };

// var GetState = function (ip, mac, next) {
//     mac = GeneralMethods.ToReadbleMac(mac);
//     if (mac in lights) {
//         next(true, lights[mac].power);
//     }
//     else {
//         next(false, 'Error');
//     }
// };

// var GetBrightnessAndColor = function (ip, mac, next) {
//     mac = GeneralMethods.ToReadbleMac(mac);
//     if (mac in lights) {
//         next(true, { bright: lights[mac].obj.bright, color: lights[mac].obj.bright });//bright // rgb
//     } else {
//         next(false, {});
//     }
// }

var SetBrightnessAndColor = function (device, value, next) {
    mac = GeneralMethods.ToReadbleMac(device.mac);
    if (mac in lights) {
        lights[mac].obj.setBright(value.bright).then(() => {
            lights[mac].obj.setCT(GeneralMethods.GetRangeFromPercent(value.color, 4100, 6500)).then(() => {
                next();
            }).catch((error => {
                next(error);
            }));
        }).catch((error => {
            next(error);
        }));
    }
    else {
        next('Mac not exsist in current module');
    }
}

var UpdateChangesRegistar = function (callback) {
    updateChangesCallbacks.push(callback);
}

module.exports = {
    GetState: GetState,
    ChangeState: ChangeState,
    GetBrightnessAndColor: GetBrightnessAndColor,
    SetBrightnessAndColor: SetBrightnessAndColor,
    UpdateChangesRegistar: UpdateChangesRegistar
};