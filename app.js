
// Project moduls 
var switchers = require('./modules/switchers');
var lights = require('./modules/lights');
var security = require('./modules/security');
var logs = require('./modules/logs');

// Depenencies moduls
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var SSE = require('express-sse');

// MiddelWhare Area 

// Parse every request body to json
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); // serve every static file in public folder
app.use(function (req, res, next) { // middelwhere for security
  if (req.url == '/login' || req.url == '/logout') { // it login logout or static file continue
    next()
    return;
  }
  security.CheckAccess(req, res, () => {
    next()
  });
})

// Server API routing

// Access API

// Login
// body should be { userName : 'theUserName', password : 'thePassword' } 
app.post('/login', function (req, res) {
  var params = req.body;
  security.CheckIn(req, params.userName, params.password, (result) => {
    if (result)
      res.send(`you connected seccessfuly`)
    else {
      res.statusCode = 403;
      res.send(`you send wrong password`)
    }
  });
});

// Logout 
app.post('/logout', function (req, res) {
  security.CheckOut(req);
  res.send(`Logout seccessfuly`);
});

// RESTful API

// Get all switchers 
app.get('/switchers', function (req, res) {
  switchers.GetSwitchers(function (devices) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(devices));
  });
});

// Get switche by mac
app.get('/switchers/:mac', function (req, res) {
  switchers.GetSwitch(req.params.mac, function (isSuccess, result) {
    if (!isSuccess)
      res.statusCode = 503;
    res.send(result)
  });
});

// Change switch state by mac
// body should be { state : 'on' OR 'off' } 
app.put('/switchers/:mac', function (req, res) {
  var params = req.body;
  var state;
  switch (params.state) {
    case 'on':
      state = true;
      break;
    case 'off':
      state = false;
      break;
    default:
      res.statusCode = 503;
      res.send('unknown parametr' + params.state)
      return;
  }

  switchers.SetState(req.params.mac, state, (isSuccess) => {
    if (!isSuccess)
      res.statusCode = 503;
    res.send(isSuccess)
  });
});



// API for lights

// Get all sockets 
app.get('/lights', function (req, res) {
  lights.GetLigthsValue(function (lights) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(lights));
  });
});

// Get light by mac
app.get('/lights/:mac', function (req, res) {
  lights.GetLight(req.params.mac, function (isSuccess, result) {
    if (!isSuccess)
      res.statusCode = 503;
    res.send(result)
  });
});


// Change light value by mac
// body should be {bright : (int 1 - 100) , color : (int 1 - 100)} 
app.put('/lights/:mac', function (req, res) {
  var params = req.body;
  // try parse value to int
  try {
    // value is range between 1 - 100
    var value = {
      bright: parseInt(params.bright),
      color: parseInt(params.color)
    };

    lights.SetValue(req.params.mac, value, (isSuccess) => {
      if (!isSuccess)
        res.statusCode = 503;
      res.send(isSuccess)
    });
  } catch (error) {
    res.statusCode = 503;
    res.send('error with param ' + params.bright + ' or ' + params.color)
  }
});

// Refresh data API (rescan lan)

// Refresh switchers and then get them
app.post('/refresh/switchers', function (req, res) {
  switchers.RefreshSwitchersData(() => {
    res.send('done');
  });
});

// Refresh lights and then
app.post('/refresh/lights', function (req, res) {
  lights.RefreshLightsValue(() => {
    res.send('done');
  });
});


// Server send event (SSE) Area

// Init the sse objects
var switchersSse = new SSE(['init'], { isSerialized: true });
var lightsSse = new SSE(['init'], { isSerialized: true });

// SSE resuest for switchers state federation
app.get('/switchers-feed', switchersSse.init);
// SSE resuest for lights value federation
app.get('/lights-feed', lightsSse.init);

// Registar updates  
switchers.UpdateChangesEventRegistar((mac, state) => {
  switchersSse.send({ 'mac': mac, 'state': state });
})

lights.UpdateChangesEventRegistar((mac, value) => {
  lightsSse.send({ 'mac': mac, 'value': value });
})

// Other API 
var publicPath = __dirname + '/public/';

// Get home page
app.get('/', function (req, res) {
  res.sendFile(publicPath + 'index.html');
});

// Unknowon routing get 404
app.get('*', function (req, res) {
  res.sendFile(publicPath + '404.html');
});

// Start application

// Listen omn port 3000 or port that host give 
app.set('port', (process.env.PORT || 3000));

// Invoke app and listen to requests
app.listen(app.get('port'), function () {
  console.log('home app run on port ' + app.get('port'));
});


