var python = require('../Commons/pythonHandler');

var ToKankunMac = function (mac) {
  return mac.toString(16)             // "4a8926c44578"
    .match(/.{1,2}/g)    //  // ["78", "45", "c4", "26", "89", "4a"]
    .join(':')
}

var ChangeState = function (ip, mac, state, next) {
  python.PythonCommand(__dirname, 'kkeps_controller.py', ['-a', state ? 'on' : 'off' , 'ip=' + ip, 'mac=' + ToKankunMac(mac)], function (err, results) {
    // The result is array with string search for error word if exist
    next(results.length > 7 && results[7].indexOf('switch') != -1);
    console.log(results);
  });
};

var GetState = function (ip, mac, next) {
  python.PythonCommand(__dirname, 'kkeps_controller.py', ['-a', 'check', 'ip=' + ip, 'mac=' + ToKankunMac(mac)], function (err, results) {
    var isSuccess = results.length > 4 && results[4].indexOf('switch') != -1;
    next(isSuccess, isSuccess ? results[4].indexOf('open') != -1 : 'Error');
    console.log(results);
  });
};

module.exports = {
  GetState: GetState,
  ChangeState: ChangeState
};




