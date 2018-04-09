var cmd = require('node-cmd');

var ChangeState = function (device, state, next) {
  cmd.get(
    __dirname + '\\' + 'OrviboController.exe ' + (state == 'on' ? ' seton ' : ' setoff ') + ' ' + device.mac.toUpperCase() + ' ' + device.ip,
    function (err, data, stderr) {
      // the tow !! is to get boolien and not value of data
      var isSuccess = !err && !!data && data.indexOf("Exception") == -1;
      next((isSuccess && data.indexOf("True") != -1) ? null :'error: ' + err + ' ' + data);
    });
};

var GetState = function (device, next) {
  cmd.get(
    __dirname + '\\' + 'OrviboController.exe query ' + device.mac.toUpperCase() + ' ' + device.ip,
    function (err, data, stderr) {
      // the tow !! is to get boolien and not value of data
      var isSuccess = !err && !!data && data.indexOf("Exception") == -1;
      next(isSuccess ? (data.indexOf('True') != -1 ? 'on' : 'off') : 'error', isSuccess ? null :'error: ' + err + ' ' + data);
    });
};

module.exports = {
  GetState: GetState,
  ChangeState: ChangeState
};