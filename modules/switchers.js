var YeelightHandler = require('./Yeelight/yeelightHandler');
var Commons = require('./commons');

var devices = require('../DB/devices.json');

// Get only switch keys
var switchersKeysArray = Commons.GetFilterdKeysByType('switch');

// callbacks to invoke when event happend
var updateCallbacks = [];
// switchers data
var lastSwitchersStat = [];

// Set new state to socket by its mac
var SetState = function (mac, state, next) {
  if (switchersKeysArray.indexOf(mac) == -1) {
    next(false);
    return;
  }

  var brandModuleHandler = Commons.GetBrandModule(devices[mac].brand);

  if (brandModuleHandler == null) {
    next(false);
    return;
  }

  brandModuleHandler.ChangeState(devices[mac].ip, mac, state, (isSuccess) => {
    // If success update last sockets state
    if (isSuccess) {
      UpdateChanges(mac, state);
    }
    next(isSuccess);
  });
};

// Recursive function to run on every switch 
// not in parallel
// (because some of devices cant work together)
var ReadSwitchersStat = function (switchers, index, next) {
  // recursive stop condition
  if (index >= switchersKeysArray.length)
    return;

  var mac = switchersKeysArray[index];
  var switchDevice = devices[mac];

  var brandModuleHandler = Commons.GetBrandModule(switchDevice.brand);

  if (brandModuleHandler == null) {
    next(false);
    return;
  }

  brandModuleHandler.GetState(switchDevice.ip, mac, function (isSuccess, state) {
    switchers.push({
      "mac": mac,
      "ip": switchDevice.ip,
      "name": switchDevice.name,
      "state": state
    })

    // In case finish all key (switchers mac) in array
    if (switchers.length >= switchersKeysArray.length) {
      next(switchers);
    } else {
      ReadSwitchersStat(switchers, index + 1, next);
    }
  });
}

//
var RefreshSwitchersData = function (next) {
  ReadSwitchersStat([], 0, (switchers) => {
    lastSwitchersStat = switchers;
    next();
  });
};


// Get switch state by mac
var GetSwitch = function (mac, next) {
  lastSwitchersStat.forEach((device) => {
    if (device.mac == mac) {
      next(true, device);
      return;
    }
  });
  next(false);
};

// Get all switchers
var GetSwitchers = function (next) {
  next(lastSwitchersStat);
}

// Update changes in array of switchers 
// and invoke event to registars mathods 
var UpdateChanges = function (mac, state) {

  updateCallbacks.forEach((item, i) => {
    item(mac, state);
  })

  lastSwitchersStat.forEach((device) => {
    if (device.mac == mac)
      device.state = state;
  });

};

// Let registar to change state event
var UpdateChangesEventRegistar = function (callback) {
  updateCallbacks.push(callback);
}

// Registar to yeelght changes
YeelightHandler.UpdateChangesRegistar((mac, state) => {
  UpdateChanges(mac, state);
})

// Get all switch data when app up
RefreshSwitchersData(() => {
  console.info("Finish getting sockets status");
});

module.exports = {
  SetState: SetState,
  GetSwitch : GetSwitch,
  GetSwitchers: GetSwitchers,
  RefreshSwitchersData: RefreshSwitchersData,
  UpdateChangesEventRegistar: UpdateChangesEventRegistar
};