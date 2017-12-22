// Logger
var logger = require('./logs');

var shortid = require('shortid');
var fs = require('fs')

var sessionsIdMap = {};
try {
  sessionsIdMap = require('../cacheSessionsIdMap.json');
} catch (error) {
  logger.write.warn("Error while reading cacheSessionsIdMap.json file")
  sessionsIdMap = {}
}

var SaveToCache = () => {
  fs.writeFile('cacheSessionsIdMap.json', JSON.stringify(sessionsIdMap), 'utf-8', function (err) {
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

var GetUserAccess = function (userName, pass) {
  var users = require('../DB/users.json');;// read users file
  if ((typeof (userName) !== "undefined" && userName) &&
    userName in users)
    return pass == users[userName];
  return false;
}

var CheckIn = function (req, res, userName, pass, next) {
  logger.security.info('username ' + userName + ' try to login with password: ' + pass + ' from IP: ' + GetIp(req));
  
  isAccess = GetUserAccess(userName, pass);

  if (!isAccess){
    logger.security.warn('username ' + userName + ' fail to login with password ' + pass + ' from IP: ' + GetIp(req));
  } else {
    var sessionId = shortid.generate()
    sessionsIdMap[sessionId] = userName;
    SaveToCache();
    res.cookie('sessionID', sessionId);//, { maxAge: 4.32e+8 }); // 5 days
    logger.security.info('username ' + userName + ' login successfuly with password: ' + pass + ' from IP: ' + GetIp(req) + ' and sessionID is: ' + sessionId);
  }

  next(isAccess);
}

var CheckOut = function (req, res) {
  var sessionCookie = req.cookies.sessionID;
  delete sessionsIdMap[sessionCookie];
  SaveToCache();  
  res.cookie('sessionID', 'empty');
  logger.security.info('user try to logout from IP: ' + GetIp(req) + ' session id: ' + sessionCookie);
}

var CheckAccess = function (req, res, next) {
  var sessionCookie = req.cookies.sessionID;
  logger.security.info('checking access to IP: ' + GetIp(req) + ' session id: ' + sessionCookie + ' for requst: ' + req.method + ' ' + req.url);
  
  if (sessionCookie in sessionsIdMap) {
    res.cookie('sessionID', sessionCookie, { maxAge: 4.32e+8 }); // 5 days    
    next();
  } else {
    logger.security.warn('access for IP: ' + GetIp(req) + ' session id: ' + sessionCookie + ' for requst: ' + req.method + ' ' + req.url + ' was forbidden');
    res.statusCode = 403;
    res.send('Athontication error');
  }
}

var ClearCache = (req, callback) => {
  var sessionCookie = req.cookies.sessionID;
  logger.security.info('Clean all access cookie, from IP: ' + GetIp(req) + ' session id: ' + sessionCookie);
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