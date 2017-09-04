var python = require('../Commons/pythonHandler');

// Access to device python api
var TouchDevice = function (ip, mac, state, next) {
  python.PythonCommand(__dirname, 'sp2.py', [ip, mac, state] , function (err, results) {
    // The result is array with string search for error word if exist
    next(results[0].indexOf('error') == -1, results);
    console.log(results);
  });
};

var ChangeState = function (ip, mac, state, next) {
  TouchDevice(ip, mac, state ? 1 : 0, function (isSuccess, result) {
    next(isSuccess);
  })
};

var GetState = function (ip, mac, next) {
  // state 2 is for pythn script to know only get status
  TouchDevice(ip, mac, 2, function (isSuccess, result) {
    next(isSuccess,isSuccess ? result[0].indexOf('True') != -1 : 'Error');
  })
};

module.exports = {
  GetStateSP: GetState,
  ChangeStateSP: ChangeState
};