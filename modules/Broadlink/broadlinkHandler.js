// Logger
var logger = require('../logs');

var python = require('../Commons/pythonHandler');
var fs = require('fs')

var irCommands = require('./irCommandsMap.json');
var chachFilePath = __dirname + '\\cacheLastOperation.json';
var cacheLastOperation;

var updateChangesCallbacks = [];

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
      logger.write.error('Error to write cacheLastOperation file');
    else
      logger.write.debug('Done to update cacheLastOperation file');
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
      logger.write.warn('ir code not found');
      next("ir code not found");
      return;
    }

    python.PythonCommand(__dirname, 'sp2.py', [device.ip, device.mac, 3, ircode], function (err, results) {
      var isSuccess = results[0].indexOf('ok') != -1;
      if (isSuccess)
        UpdateCache(device.deviceIdentity,
          cacheLastOperation[device.deviceIdentity].ircode,// Dont change operation
          state)
      next(isSuccess ? null : "The IR transmitter is probably not connected or IR code invalid");
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
    if (!(device.deviceIdentity in cacheLastOperation)) {
      try {
        ircode = irCommands[device.deviceIdentity].mode['hot']['low'][16];
      } catch (error) {
        ircode = 'empty';
      }
      UpdateCache(device.deviceIdentity,
        ircode,
        'off',
        {
          mode: "hot",
          fan_strength: "low",
          temp: 16
        });
      next('error', 'There is no ir code in irCommandsMapFile for ' + device.deviceIdentity + ' device');
      return;
    }

    python.PythonCommand(__dirname, 'sp2.py', [device.ip, device.mac, 3, 'CheckAlive'], function (err, results) {
      var isSuccess = results[0].indexOf('ok') != -1;
      next(cacheLastOperation[device.deviceIdentity].state, isSuccess ? null : "The IR transmitter is probably not connected or IR code is invalid");
    });

    return;
  }

  TouchDevice(device.ip, device.mac, 2, function (isSuccess, result) {
    next(isSuccess ? (result[0].indexOf('True') != -1 ? 'on' : 'off') : 'error', isSuccess ? null : 'Error');
  })
};

var GetACData = (device, next) => {
  if (!(device.deviceIdentity))
    next({}, "Device not have identity field");
  else if (!(device.deviceIdentity in cacheLastOperation)) {
    UpdateCache(device.deviceIdentity,
      'empty',
      'off',
      {
        mode: "hot",
        fan_strength: "low",
        temp: 16
      });
    next({}, 'please insret ir code in irCommandsMapFile');
    return;
  }

  python.PythonCommand(__dirname, 'sp2.py', [device.ip, device.mac, 3, 'CheckAlive'], function (err, results) {
    var isSuccess = results[0].indexOf('ok') != -1;
    next(cacheLastOperation[device.deviceIdentity].value, isSuccess ? null : "The IR transmitter is probably not connected or IR code is invalid");
  });
}

var SetACData = (device, value, next) => {

  var ircode;
  try {
    ircode = irCommands[device.deviceIdentity].mode[value.mode][value.fan_strength][value.temp];
  } catch (error) {
    ircode = false;
  }

  if (!ircode) {
    next("Error, ir code not found");
    return;
  }

  python.PythonCommand(__dirname, 'sp2.py', [device.ip, device.mac, 3, ircode], function (err, results) {
    var isSuccess = results[0].indexOf('ok') != -1;
    if (isSuccess) {
      UpdateCache(device.deviceIdentity, ircode, "on", value);
      // if success, ac turn on auto
      device.state = 'on';
      updateChangesCallbacks.forEach((methodRegistrad) => {
        methodRegistrad(device);
      });
    }
    next(isSuccess ? null : "The IR transmitter is probably not connected or IR code is not valid");
  });
}


var UpdateChangesRegistar = function (callback) {
  updateChangesCallbacks.push(callback);
}

// TODO if switch for rm need send correct command and not like sp2
module.exports = {
  GetState: GetState,
  ChangeState: ChangeState,
  SetACData: SetACData,
  GetACData: GetACData,
  UpdateChangesRegistar: UpdateChangesRegistar
};