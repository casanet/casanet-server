const miio = require('miio');
var devices = require('../../DB/devices.json');

// struc of all light obj map by its mac
var lights = {};
updateChangesCallbacks = [];

var ChangeState = function (device, state, next) {
    if (!(device.mac in lights)) {
        next('Mac not exsist in module lights');
        return;
    }

    lights[device.mac].call('set_power', [state])
        .then((result) => {
            if (state == 'on') {
                // some time ligt dont know what is the color and bright so init it
                // to know if light in error mode read data and watch if it 0 (error value)
                GetBrightnessAndColor(device, (value, err) => {
                    if (err) {
                        next(err);
                    } else if (value.bright != 0 && value.color != 0) {
                        next(result[0] == 'ok' ? null : 'Error');
                    } else {
                        SetBrightnessAndColor(device, device.light, (err) => {
                            next(err);
                        })
                    }
                })
            } else {
                next(result[0] == 'ok' ? null : 'Error');
            }
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
            lights[device.mac] = lightDevice;
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

var UpdateChangesRegistar = function (callback) {
    updateChangesCallbacks.push(callback);
}

var GetBrightnessAndColor = function (device, next) {
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token, //'3d5f7ae53b51aa312e464b150b37453b',
        model: device.mac
    });

    lightDevice.init()
        .then(() => {
            lights[device.mac] = lightDevice;
            lightDevice.call('get_prop', ['bright'])
                .then((bright) => {
                    lightDevice.call('get_prop', ['cct'])
                        .then((cct) => {
                            next({ bright: bright[0], color: cct[0] });
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

var SetBrightnessAndColor = function (device, value, next) {
    if (!(device.mac in lights)) {
        next('Mac not exsist in module lights');
        return;
    }

    lights[device.mac].call('set_bricct', [value.bright, value.color])
        .then((result) => {
            next(result[0] == 'ok' ? null : 'Error');
        })
        .catch((err) => {
            next(err);
        });
}

module.exports = {
    GetBrightnessAndColor: GetBrightnessAndColor,
    SetBrightnessAndColor: SetBrightnessAndColor,
    GetState: GetState,
    ChangeState: ChangeState,
    UpdateChangesRegistar: UpdateChangesRegistar
};