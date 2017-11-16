// Logger
var logger = require('../logs');

var python = require('../Commons/pythonHandler');
var fs = require('fs')

var irCommands = require('./irCommandsMap.json');
var chachFilePath = __dirname + '\\cacheLastOperation.json';
var cacheLastOperation;

try {
  cacheLastOperation = require(chachFilePath);
} catch (error) {
  cacheLastOperation = {}
}

var UpdateCache = (deviceInentity, operationIrCode, state, value) => {

  if (!(deviceInentity in cacheLastOperation))
    cacheLastOperation[deviceInentity] = {};

  cacheLastOperation[deviceInentity].ircode = operationIrCode;
  if (value)
    cacheLastOperation[deviceInentity].value = value;
  if (state)
    cacheLastOperation[deviceInentity].state = state;

  // Save to operationIrCode file
  fs.writeFile(chachFilePath, JSON.stringify(cacheLastOperation, null, '\t'), 'utf-8', function (err) {
    if (err)
      logger.error('Error to write cacheLastOperation file');
    else
      logger.debug('Done to update cacheLastOperation file');
  })
}

// Access to device SP2 python api
var TouchDevice = function (ip, mac, state, next) {
  python.PythonCommand(__dirname, 'sp2.py', [ip, mac, state], function (err, results) {
    // The result is array with string search for error word if exist
    next(results[0].indexOf('error') == -1, results);
  });
};

var ChangeState = function (device, state, next) {
  if (device.deviceIdentity) {
    var ircode = (state == 'on' ? cacheLastOperation[device.deviceIdentity].ircode : irCommands[device.deviceIdentity].off);

    if (!ircode) {
      logger.warn('ir code not found');
      next("ir code not found");
      return;
    }

    python.PythonCommand(__dirname, 'sp2.py', [device.ip, device.mac, 3, ircode], function (err, results) {
      var isSuccess = results[0].indexOf('ok') != -1;
      if (isSuccess)
        UpdateCache(device.deviceIdentity,
          cacheLastOperation[device.deviceIdentity].ircode,// Dont change operation
          state)
      next(isSuccess ? null : "The IR transmitter is probably not connected");
    });


    return;
  }

  TouchDevice(device.ip, device.mac, state == 'on' ? 1 : 0, function (isSuccess, result) {
    next(isSuccess ? null : 'Error');
  })
};

var GetState = function (device, next) {
  // state 2 is for pythn script to know only get status
  if (device.deviceIdentity) {
    if (!(device.deviceIdentity in cacheLastOperation))
      next({}, "Device not have alredy cache of last operation");
    else
      next(cacheLastOperation[device.deviceIdentity].state);
    return;
  }

  TouchDevice(device.ip, device.mac, 2, function (isSuccess, result) {
    next(isSuccess ? (result[0].indexOf('True') != -1 ? 'on' : 'off') : 'error', isSuccess ? null : 'Error');
  })
};

var GetACData = (device, next) => {
  if (!(device.deviceIdentity))
    next({}, "Device not have identity field");
  else if (!(device.deviceIdentity in cacheLastOperation))
    next({}, "Device not have alredy cache of last operation");
  else
    next(cacheLastOperation[device.deviceIdentity].value);
}

var SetACData = (device, value, next) => {
  var ircode = irCommands[device.deviceIdentity].mode[value.mode][value.fan_strength][value.temp];

  if (!ircode) {
    next("Error, ir code not found");
    return;
  }

  python.PythonCommand(__dirname, 'sp2.py', [device.ip, device.mac, 3, ircode], function (err, results) {
    var isSuccess = results[0].indexOf('ok') != -1;
    if (isSuccess)
      UpdateCache(device.deviceIdentity, ircode, "on", value);
    next(isSuccess ? null : "The IR transmitter is probably not connected");
  });
}

// TODO if switch for rm need send correct command and not like sp2
module.exports = {
  GetState: GetState,
  ChangeState: ChangeState,
  SetACData: SetACData,
  GetACData: GetACData
};