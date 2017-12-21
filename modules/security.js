// Logger
var logger = require('./logs');

var logs = require('./logs');
var shortid = require('shortid');

var sessionsIdMap = {};

var GetUserAccess = function (userName, pass) {
  var users = require('../DB/users.json');;// read users file
  if ((typeof (userName) !== "undefined" && userName) &&
    userName in users)
    return pass == users[userName];
  return false;
}

var CheckIn = function (req, res, useName, pass, next) {
  isAccess = GetUserAccess(useName, pass);

  if (isAccess) {
    var sessionId = shortid.generate()
    sessionsIdMap[sessionId] = true;
    res.cookie('sessionID', sessionId);//, { maxAge: 4.32e+8 }); // 5 days
  }
  next(isAccess);
}

var CheckOut = function (req, res) {
  var sessionCookie = req.cookies.sessionID;
  delete sessionsIdMap[sessionCookie];
  res.cookie('sessionID', 'empty');
}

var CheckAccess = function (req, res, next) {
  var sessionCookie = req.cookies.sessionID;
  if (sessionCookie in sessionsIdMap) {
    res.cookie('sessionID', sessionCookie, { maxAge: 4.32e+8 }); // 5 days    
    next();
  } else {
    res.statusCode = 403;
    res.send('Athontication error');
  }
}

var ClearCache = (callback) => {
  sessionsIdMap = {};
}

module.exports = {
  CheckIn: CheckIn,
  CheckOut: CheckOut,
  CheckAccess: CheckAccess,
  ClearCache: ClearCache
}; 