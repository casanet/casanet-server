var YeelightHandler = require('../Yeelight/yeelightHandler');

const miio = require('miio');

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
    YeelightHandler.SetBrightness(device, value, next);
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
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
}

module.exports = {
    GetState: GetState,
    ChangeState: ChangeState,
    GetBrightness: GetBrightness,
    SetBrightness: SetBrightness,
    GetColorTemperature: GetColorTemperature,
    SetColorTemperature: SetColorTemperature
};