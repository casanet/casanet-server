var python = require('../Commons/pythonHandler');

var ToKankunMac = function (mac) {
  return mac.toString(16)             // "4a8926c44578"
    .match(/.{1,2}/g)    //  // ["78", "45", "c4", "26", "89", "4a"]
    .join(':')
}

var ChangeState = function (device, state, next) {
  python.PythonCommand(__dirname, 'kkeps_controller.py', ['-a', state , 'ip=' + device.ip, 'mac=' + ToKankunMac(device.mac)], function (err, results) {
    // The result is array with string search for error word if exist
    next((results.length > 7 && results[7].indexOf('switch') != -1) ? null : err);
  });
};

var GetState = function (device, next) {
  python.PythonCommand(__dirname, 'kkeps_controller.py', ['-a', 'check', 'ip=' + device.ip, 'mac=' + ToKankunMac(device.mac)], function (err, results) {
    var isSuccess = results.length > 4 && results[4].indexOf('switch') != -1;
    next(isSuccess ? (results[4].indexOf('open') != -1 ? 'on' : 'off') : 'error', isSuccess ? null : err);
  });
};

module.exports = {
  GetState: GetState,
  ChangeState: ChangeState
};




