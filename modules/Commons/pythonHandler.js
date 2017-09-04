var PythonShell = require('python-shell');

// Access to device python api
var SendCommand = function (dir,file, arg, next) {
  var options = {
    mode: 'text',
    pythonPath: 'C:/Python27/python.exe',
    scriptPath: dir,
    args: arg
  };

  PythonShell.run(file, options, function (err, results) {
    next(err, results);
  });
};

module.exports = {PythonCommand : SendCommand }; 