var python = require('../Commons/pythonHandler');

// Access to device python api
var TouchDevice = function (ip, mac, state, next) {
  python.PythonCommand(__dirname, 'sp2.py', [ip, mac, state] , function (err, results) {
    // The result is array with string search for error word if exist
    next(results[0].indexOf('error') == -1, results);
  });
};

var ChangeState = function (device, state, next) {
  TouchDevice(device.ip, device.mac, state == 'on' ? 1 : 0, function (isSuccess, result) {
    next(isSuccess ? null : 'Error');
  })
};

var GetState = function (device, next) {
  // state 2 is for pythn script to know only get status
  TouchDevice(device.ip, device.mac, 2, function (isSuccess, result) {
    next(isSuccess ? (result[0].indexOf('True') != -1 ? 'on' : 'off' ) :'error', isSuccess ? null : 'Error');
  })
};

module.exports = {
  GetState: GetState,
  ChangeState: ChangeState
};