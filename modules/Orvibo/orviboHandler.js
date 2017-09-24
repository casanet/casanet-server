var cmd = require('node-cmd');

var ChangeState = function (ip, mac, state, next) {
  cmd.get(
    __dirname + '\\' + 'OrviboController.exe ' + (state ? ' seton ' : ' setoff ') + ' ' + mac.toUpperCase() + ' ' + ip,
    function (err, data, stderr) {
      console.log(data);
      next(!err && data.indexOf("True") != -1);
    });
};

var GetState = function (ip, mac, next) {
  cmd.get(
    __dirname + '\\' + 'OrviboController.exe query ' + mac.toUpperCase() + ' ' + ip,
    function (err, data, stderr) {
      console.log(err ? err : data);
      // the tow !! is to get boolien and not value of data
      var isSuccess = !err && !!data;
      next(isSuccess, isSuccess ? data.indexOf('True') != -1 : 'Error');
    });
};

var GetAllState = function (next) {
  next();
};

module.exports = {
  GetState: GetState,
  ChangeState: ChangeState
};