// Logger
var logger = require('./logs');

var shortid = require('shortid');
var fs = require('fs')

var sessionsIdMap = {};
try {
  sessionsIdMap = require('../cache/cacheSessionsIdMap.json');
} catch (error) {
  logger.write.warn("Error while reading cacheSessionsIdMap.json file")
  sessionsIdMap = {}
}

var SaveToCache = () => {
  fs.writeFile('cache/cacheSessionsIdMap.json', JSON.stringify(sessionsIdMap), 'utf-8', function (err) {
    if (err)
      logger.write.warn('Error to write cacheSessionsIdMap file');
  })
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


var GetAllRquestInfo = (req) => {
  return ' IP: ' + GetIp(req) + ',    SESSION_ID: ' + req.cookies.sessionID + ',    REQUEST: ' + req.method + ' ' + req.url + ',    DEVICE: ' + req.useragent.platform + ',    OS: ' + req.useragent.os + ',    BROWSER: ' + req.useragent.browser + '/' + req.useragent.version + ',    IS MOBILE: ' + req.useragent.isMobile;
}


var GetUserAccess = function (userName, pass) {
  var users = require('../DB/users.json');;// read users file
  if ((typeof (userName) !== "undefined" && userName) &&
    userName in users)
    return pass == users[userName];
  return false;
}

var CheckIn = function (req, res, userName, pass, next) {
  logger.security.info('username ' + userName + ' try to login with password: ' + pass + GetAllRquestInfo(req));

  isAccess = GetUserAccess(userName, pass);

  if (!isAccess) {
    logger.security.warn('username ' + userName + ' fail to login with password ' + pass + GetAllRquestInfo(req));
  } else {
    var sessionId = shortid.generate()
    sessionsIdMap[sessionId] = userName;
    SaveToCache();
    res.cookie('sessionID', sessionId);//, { maxAge: 4.32e+8 }); // 5 days
    logger.security.info('username ' + userName + ' login successfuly with password: ' + pass + GetAllRquestInfo(req));
  }

  next(isAccess);
}

var CheckOut = function (req, res) {
  var sessionCookie = req.cookies.sessionID;
  delete sessionsIdMap[sessionCookie];
  SaveToCache();
  res.cookie('sessionID', 'empty');
  logger.security.info('User try to logout ' + GetAllRquestInfo(req));
}

var CheckAccess = function (req, res, next) {
  var sessionCookie = req.cookies.sessionID;
  logger.security.info('Checking access to ' + GetAllRquestInfo(req));

  if (sessionCookie in sessionsIdMap) {
    next();
  } else {
    logger.security.warn('Access forbidden ' + GetAllRquestInfo(req));
    res.statusCode = 403;
    res.send('Athontication error');
  }
}

var ClearCache = (req, callback) => {
  logger.security.info('Clean all access cookie, '  + GetAllRquestInfo(req));
  sessionsIdMap = {};
  SaveToCache();
  callback();
}

module.exports = {
  CheckIn: CheckIn,
  CheckOut: CheckOut,
  CheckAccess: CheckAccess,
  ClearCache: ClearCache
}; 