const miio = require('miio');
var devices = require('../../DB/devices.json');

// struc of all light obj map by its mac
var lights = {};
updateChangesCallbacks = [];

var ChangeState = function (ip, mac, state, next) {
    if (!(mac in lights)) {
        next(false);
        return;
    }

    lights[mac].call('set_power', [state ? 'on' : 'off'])
        .then((result) => {
            console.log('philips light ' + mac + ' set successfuly');
            next(result[0] == 'ok' ? true : false);
        })
        .catch((err) => {
            next(false);
        });
};

var GetState = function (ip, mac, next) {
    const device = miio.createDevice({
        address: ip,
        token: devices[mac].token, //'3d5f7ae53b51aa312e464b150b37453b',
        model: mac
    });

    device.init()
        .then(() => {

            lights[mac] = device;
            console.log('get philips light ' + mac);
            device.call('get_prop', ['power'])
                .then((power) => {
                    console.log('philips light ' + mac + ' state ' + power[0]);

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

var UpdateChangesRegistar = function (callback) {
    updateChangesCallbacks.push(callback);
}

var GetBrightnessAndColor = function (ip, mac, next) {
    const device = miio.createDevice({
        address: ip,
        token: devices[mac].token, //'3d5f7ae53b51aa312e464b150b37453b',
        model: mac
    });

    device.init()
        .then(() => {

            lights[mac] = device;
            console.log('get philips light ' + mac);
            device.call('get_prop', ['bright'])
                .then((bright) => {

                    device.call('get_prop', ['cct'])
                        .then((cct) => {
                            console.log('philips light ' + cct + ' state ' + bright);

                            next(true, { bright: bright[0], color: cct[0] });
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

var SetBrightnessAndColor = function (ip, mac, value, next) {
    if (!(mac in lights)) {
        next(false);
        return;
    }

    lights[mac].call('set_bricct', [value.bright, value.color])
        .then((result) => {
            console.log('philips light bricct ' + mac + ' set successfuly');
            next(result[0] == 'ok' ? true : false);
        })
        .catch((err) => {
            next(false);
        });

}

module.exports = {
    GetBrightnessAndColor: GetBrightnessAndColor,
    SetBrightnessAndColor: SetBrightnessAndColor,
    GetState: GetState,
    ChangeState: ChangeState,
    UpdateChangesRegistar: UpdateChangesRegistar
};