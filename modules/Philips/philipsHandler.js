var YeelightHandler = require('../Yeelight/yeelightHandler');

const miio = require('miio');

var updateChangesCallbacks = [];

var ChangeState = (device, state, next) => {
    YeelightHandler.ChangeState(device, state, next);
};

var GetState = (device, next) => {
    YeelightHandler.GetState(device, next);
};

var GetBrightness = (device, next) => {
    YeelightHandler.GetBrightness(device, next);
}

var SetBrightness = (device, value, next) => {
    YeelightHandler.SetBrightness(device, value, (err) => {
        // if success, light turn on auto
        if (!err) {
            device.state = 'on';
            updateChangesCallbacks.forEach((methodRegistrad) => {
                methodRegistrad(device);
            });
        }
        next(err);
    });
}

var GetColorTemperature = (device, next) => {

    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

    lightDevice.init()
        .then(() => {
            lightDevice.call('get_prop', ['cct'])
                .then((temperature) => {
                    next(parseInt(temperature[0]));
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
    const lightDevice = miio.createDevice({
        address: device.ip,
        token: device.token,
        model: 'datamodel'
    });

    lightDevice.init()
        .then(() => {
            lightDevice.call('set_bricct', [device.bright, value])
                .then((res) => {
                    next();
                    // if success, light turn on auto
                    device.state = 'on';
                    updateChangesCallbacks.forEach((methodRegistrad) => {
                        methodRegistrad(device);
                    });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
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
    UpdateChangesRegistar: UpdateChangesRegistar
};