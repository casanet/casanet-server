// Logger
var logger = require('./logs');

var fs = require('fs')
var logs = require('./logs');

var sessions;
try {
  sessions = require('../DB/sessions.json');
} catch (error) {
  sessions = {}
}

var GetIp = function (req) {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    var list = ipAddr.split(",");
    ipAddr = list[list.length - 1];
  } else {
    ipAddr = req.connection.remoteAddress;
  }
  return ipAddr;
}

var GetUserAccess = function (userName, pass) {
  var users = require('../DB/users.json');;// read users file
  if ((typeof (userName) !== "undefined" && userName) &&
    userName in users)
    return pass == users[userName];
  return false;
}

var UpdateSession = function (ip, isAccess) {
  if (!(ip in sessions))
    sessions[ip] = {};

  sessions[ip].allow = isAccess;

  // Save to session file
  fs.writeFile('./DB/sessions.json', JSON.stringify(sessions), 'utf-8', function (err) {
    if (err)
      logger.write.error('Error to write session file');
    else
      logger.write.debug('Done to update session file');
  })
}

var CheckSession = function (ip) {
  var checkResult = typeof (ip) !== "undefined" &&
    ip &&
    ip in sessions &&
    sessions[ip].allow;

  return checkResult;
}


var CheckIn = function (req, useName, pass, next) {
  ip = GetIp(req);
  isAccess = GetUserAccess(useName, pass);

  UpdateSession(ip, isAccess);

  next(isAccess);
}

var CheckOut = function (req) {
  ip = GetIp(req);
  UpdateSession(ip, false);
}

var CheckAccess = function (req, res, next) {
  ip = GetIp(req);
  if (!CheckSession(ip)) {
    res.statusCode = 403;
    res.send('Athontication error');
  } else {
    next();
  }
}

module.exports = {
  CheckIn: CheckIn,
  CheckOut: CheckOut,
  CheckAccess: CheckAccess,
}; 