// Logger
var logger = require('./logs');

var fs = require('fs')
var logs = require('./logs');
var shortid = require('shortid');

var sessions;
try {
  sessions = require('../DB/sessions.json');
} catch (error) {
  sessions = {}
}

var sessionsIdMap = {};

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


var CheckIn = function (req, res, useName, pass, next) {
  ip = GetIp(req);
  isAccess = GetUserAccess(useName, pass);

  UpdateSession(ip, isAccess);

  if (isAccess) {
    var sessionId = shortid.generate()
    sessionsIdMap[sessionId] = true;
    res.cookie('sessionID' , sessionId, {maxAge : 4.32e+8}); // 5 days
  }
  next(isAccess);
}

var CheckOut = function (req, res) {
  ip = GetIp(req);
  var sessionCookie = req.cookies.sessionID;
  delete sessionsIdMap[sessionCookie];
  res.cookie('sessionID', 'empty');
  UpdateSession(ip, false);
}

var CheckAccess = function (req, res, next) {
  var sessionCookie = req.cookies.sessionID;
  if (sessionCookie in sessionsIdMap) {
    next();
    return;
  }

  ip = GetIp(req);
  if (!CheckSession(ip)) {
    res.statusCode = 403;
    res.send('Athontication error');
  } else {
    next();
  }
}

var ClearCache = (callback) => {
  sessions = {};
  sessionsIdMap = {};
  fs.writeFile('./DB/sessions.json', JSON.stringify(sessions), 'utf-8', function (err) {
    if (err)
      logger.write.error('Error to write session file');
    else
      logger.write.debug('Done to update session file');

    callback(err);
  })
}

module.exports = {
  CheckIn: CheckIn,
  CheckOut: CheckOut,
  CheckAccess: CheckAccess,
  ClearCache: ClearCache
}; 