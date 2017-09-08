var BroadLinkHandler = require('./Broadlink/broadlinkHandler');
var OrviboHandler = require('./Orvibo/orviboHandler');
var KankunHandler = require('./Kankun/kankunHandler');

var sockets = require('../DB/sockets.json');
var sockestKeysArray = Object.keys(sockets);

var lastSocketsStat = [];

// Set new state to socket by its mac
var SetDeviceState = function (mac, state, next) {
  if (!(mac in sockets))
    next(false);// TODO set in main

  var SetChanges = function (isSuccess, mac, state, next) {
    // If success update last sockets state
    if (isSuccess) {
      lastSocketsStat.forEach((device) => {
        if (device.mac == mac)
          device.state = state;
      });
    }
    next(isSuccess);
  };

  switch (sockets[mac].brand) {
    case 'Broadlink':
      BroadLinkHandler.ChangeStateSP(sockets[mac].ip, mac, state, function (result) {
        SetChanges(result, mac, state, next);
      });
      break;
    case 'Orvibo':
      OrviboHandler.ChangeStateS20(sockets[mac].ip, mac, state, function (result) {
        SetChanges(result, mac, state, next);
      });
      break;
    case 'Kankun':
      KankunHandler.ChangeStateK(sockets[mac].ip, mac, state, function (result) {
        SetChanges(result, mac, state, next);
      });
      break;
    default:
      next(false);
      break;
  }
};

// Get socket state
var GetDevice = function (mac, next) {
  if (!(mac in sockets)) {
    next(false);// TODO set in main
    return;
  }

  var device = sockets[mac];
  device.mac = mac;


  var HandleResult = function (isSuccess, state) {

    next({
      "mac": device.mac,
      "ip": device.ip,
      "name": device.name,
      "state": state
    })
  };

  switch (device.brand) {
    case 'Broadlink':
      BroadLinkHandler.GetStateSP(device.ip, device.mac, HandleResult);
      break;
    case 'Orvibo':
      OrviboHandler.GetStateS20(device.ip, device.mac, HandleResult);
      break;
    case 'Kankun':
      KankunHandler.GetStateK(device.ip, device.mac, HandleResult);
      break;
    default:
      next(false);
      break;
  }
};

// Recursive function to run on every socket not in parallel
// (becuse some of sockets cant work together)
var GetDevicesState = function (devices, index, next) {
  // recursive stop condition
  if (index >= sockestKeysArray.length)
    return;

  var SaveAndRecurceCondition = function (devices, device, state, index, next) {
    devices.push({
      "mac": device.mac,
      "ip": device.ip,
      "name": device.name,
      "state": state
    })

    // In case finish all key (sockets mac) in array
    if (devices.length >= sockestKeysArray.length) {
      next(devices);
    } else {
      GetDevicesState(devices, index + 1, next);
    }
  }

  var mac = sockestKeysArray[index];
  var device = sockets[mac];
  device.mac = mac;

  switch (device.brand) {
    case 'Broadlink':
      BroadLinkHandler.GetStateSP(device.ip, device.mac, function (isSuccess, state) {
        SaveAndRecurceCondition(devices, device, state, index, next);
      });
      break;
    case 'Orvibo':
      OrviboHandler.GetStateS20(device.ip, device.mac, function (isSuccess, state) {
        SaveAndRecurceCondition(devices, device, state, index, next);
      });
      break;
    case 'Kankun':
      KankunHandler.GetStateK(device.ip, device.mac, function (isSuccess, state) {
        SaveAndRecurceCondition(devices, device, state, index, next);
      });
      break;
    default:
      next(false);
      break;
  }
}

var RefreshDevices = function (next) {
  GetDevicesState([], 0, (devices) => {
    lastSocketsStat = devices;
    next(devices);
  });
};

// Manage fast getting sockets

RefreshDevices(() => {
  console.info("\n\nFinish getting sockets status");
});

var GetDevices = function (next) {
  next(lastSocketsStat);
}

module.exports = {
  GetDevice: GetDevice,
  SetDeviceState: SetDeviceState,
  GetDevices: GetDevices,
  RefreshDevices: RefreshDevices
};