var Commons = require('./commons');

var devices = require('../DB/devices.json');

// Get only lights keys;
var lightsKeysArray = Commons.GetFilterdKeysByType('light');

// callbacks to invoke when event happend
var updateCallbacks = [];
// Ligth data
var lastLigthValue = [];

// Set new vale to light by its mac
var SetValue = function (mac, value, next) {
  if (lightsKeysArray.indexOf(mac) == -1) {
    next(false);
    return;
  }

  var brandModuleHandler = Commons.GetBrandModule(devices[mac].brand);

  if (brandModuleHandler == null) {
    next(false);
    return;
  }

  brandModuleHandler.SetBrightnessAndColor(devices[mac].ip, mac, value, function (isSuccess) {
    // If success update last sockets state
    if (isSuccess) {
      UpdateChanges(mac, value);
    }
    next(isSuccess);
  });
};

// Recursive function to run on every socket not in parallel
// (becuse some of devices cant work together)
var ReadLightsValue = function (lights, index, next) {
  // recursive stop condition
  if (index >= lightsKeysArray.length)
    return;

  var mac = lightsKeysArray[index];
  var light = devices[mac];

  var brandModuleHandler = Commons.GetBrandModule(light.brand);

  if (brandModuleHandler == null) {
    next(false);
    return;
  }

  brandModuleHandler.GetBrightnessAndColor(light.ip, mac, function (isSuccess, value) {
    lights.push({
      "mac": mac,
      "ip": light.ip,
      "name": light.name,
      "value": value
    })

    // In case finish all key (sockets mac) in array
    if (lights.length >= lightsKeysArray.length) {
      next(lights);
    } else {
      ReadLightsValue(lights, index + 1, next);
    }
  });
}

//
var RefreshLightsValue = function (next) {
  ReadLightsValue([], 0, (lights) => {
    lastLigthValue = lights;
    next();
  });
};

// Get all lights value
var GetLigthsValue = function (next) {
  next(lastLigthValue);
}
// Get switch state by mac
var GetLight = function (mac, next) {
  lastLigthValue.forEach((light) => {
    if (light.mac == mac) {
      next(true, light);
      return;
    }
  });
  next(false);
};

// Update changes in array of switchers 
// and invoke event to registars mathods 
var UpdateChanges = function (mac, value) {
  updateCallbacks.forEach((item, i) => {
    item(mac, value);
  })

  lastLigthValue.forEach((light) => {
    if (light.mac == mac)
      light.value = value;
  });

};

// Let registar to change value event
var UpdateChangesEventRegistar = function (callback) {
  updateCallbacks.push(callback);
}

// Get all lights data when app up
RefreshLightsValue(() => {
  console.info("Finish getting ligth value");
});

module.exports = {
  SetValue: SetValue,
  GetLigthsValue: GetLigthsValue,
  GetLight : GetLight,
  RefreshLightsValue: RefreshLightsValue,
  UpdateChangesEventRegistar: UpdateChangesEventRegistar
};