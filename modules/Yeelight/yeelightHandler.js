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
    console.log("new yeelight detected: id=" + light.id + " name=" + light.name);

    light.on("connected", () => {
        lights[light.mac] = { power: light.power, obj: light };

        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), light.power);
        });

        console.log("connected");
    });

    light.on("disconnected", () => {
        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), false);
        });
        if (!(light.mac in lights))
            lights[light.mac].power = false;
    });

    light.on("stateUpdate", (light) => {

        if (!(light.mac in lights) || lights[light.mac].power == light.power)
            return;

        lights[light.mac].power = light.power;

        updateChangesCallbacks.forEach((item, i) => {
            item(light.mac.replace(/:/g, ''), light.power);
        });

        console.log(light.mac + ' updated');
    });
});

//////////////////////////////////
// Using miio protocoll like philips 
const miio = require('miio');

var miioLights = {};
var ChangeState = function (ip, mac, state, next) {
    if (!(mac in miioLights)) {
        next(false);
        return;
    }

    miioLights[mac].call('set_power', [state ? 'on' : 'off'])
        .then((result) => {
            next(result[0] == 'ok' ? true : false);
        })
        .catch((err) => {
            next(false);
        });
};

var GetState = function (ip, mac, next) {
    const device = miio.createDevice({
        address: ip,
        token: devices[mac].token, 
        model: mac
    });

    device.init()
        .then(() => {

            miioLights[mac] = device;
            device.call('get_prop', ['power'])
                .then((power) => {
                    next(true, power[0] == 'on' ? true : false);
                })
                .catch((err) => {
                    next(false, 'Error');
                });
        })
        .catch((err) => {
            next(false, 'Error');
        });
};

var GetBrightnessAndColor = function (ip, mac, next) {
    const device = miio.createDevice({
        address: ip,
        token: devices[mac].token,
        model: mac
    });

    device.init()
        .then(() => {

            miioLights[mac] = device;            
            device.call('get_prop', ['bright'])
                .then((bright) => {

                    device.call('get_prop', ['ct'])
                        .then((cct) => {
                            next(true, { bright: parseInt(bright[0]), color: GeneralMethods.SetRangeToPercent(parseInt(cct[0]) , 4100, 6500)});
                        })
                        .catch((err) => {
                            next(false, {});
                        });
                })
                .catch((err) => {
                    next(false,{});
                });
        })
        .catch((err) => {
            next(false, {});
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

var SetBrightnessAndColor = function (ip, mac, value, next) {
    mac = GeneralMethods.ToReadbleMac(mac);
    if (mac in lights) {
        lights[mac].obj.setBright(value.bright).then(() => {
            lights[mac].obj.setCT(GeneralMethods.GetRangeFromPercent(value.color, 4100, 6500)).then(() => {
                next(true);
            }).catch((error => {
                next(false);
            }));
        }).catch((error => {
            next(false);
        }));
    }
    else {
        next(false);
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