
const Lookup = require("node-yeelight-wifi").Lookup;
let lookup = new Lookup();


var ToReadbleMac = function (mac) {
    return mac.toString(16)             // "4a8926c44578"
        .match(/.{1,2}/g)    //  // ["78", "45", "c4", "26", "89", "4a"]
        .join(':')
}

// struc of all light obj map by its mac
var lights = {};
updateChangesCallbacks = [];

// Registar to detect new light
lookup.on("detected", (light) => {
    // Save obj
    lights[light.mac] = { power: light.power , obj :light};
    console.log("new yeelight detected: id=" + light.id + " name=" + light.name);

    light.on("connected", () => {
        lights[light.mac] = { power: light.power, obj :light };

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

var ChangeState = function (ip, mac, state, next) {
    mac = ToReadbleMac(mac);
    if (mac in lights) {
        lights[mac].obj.setPower(state).then(() => {
            next(true);
            console.log("success");
        }).catch((error => {
            next(false);
            console.log("failed", error);
        }));

    }
    else {
        next(false);
    }
};

var GetState = function (ip, mac, next) {
    mac = ToReadbleMac(mac);
    if (mac in lights) {
        next(true, lights[mac].power);
    }
    else {
        next(false, 'Error');
    }
};

var UpdateChangesRegistar = function (callback) {
    updateChangesCallbacks.push(callback);
}

module.exports = {
    GetState: GetState,
    ChangeState: ChangeState,
    UpdateChangesRegistar: UpdateChangesRegistar
};