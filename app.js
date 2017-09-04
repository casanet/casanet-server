// Moduls useing ----------------------

// Project moduls 
var sockets = require('./modules/sockets');

// Depenencies moduls
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var SSE = require('express-sse');

// Server send event (SSE) Area ------------------

// Init the sse object
var switchSse = new SSE(['init'], { isSerialized: true });

// SSE resuest for sockets state federation
app.get('/update', switchSse.init);

// MiddelWhare Area ----------------------------

// Parse every request body to json
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Server API routing ----------------------------

// REST API

// Get all sockets 
app.get('/devices', function (req, res) {
  sockets.GetDevices(function (devices) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(devices));
  });
});

// Refresh devices and then get them
app.post('/refreshDevices', function (req, res) {
  sockets.RefreshDevices(function (devices) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(devices));
  });
});

// Get socket by mac
app.get('/devices/:mac', function (req, res) {
  sockets.GetDevice(req.params.mac, function (result) {
    res.send(result)
  });
});

// Change socket state by mac
app.put('/devices/:mac', function (req, res) {
  var params = req.body;
  var state;
  if (params.state == 'on')
    state = true;
  else if (params.state == 'off')
    state = false;
  else {
    res.statusCode = 404;
    res.send(false)
    return;
  }

  sockets.SetDeviceState(req.params.mac, state, function (isSuccess) {
    if (!isSuccess) {
      res.statusCode = 503;
    } else {
      switchSse.send({ 'mac': req.params.mac, 'state': state });
    }
    res.send(isSuccess)
  });
});

// Listen omn port 8001 or port that host give 
app.set('port', (process.env.PORT || 3000));

// Invoke app and listen to requests
app.listen(app.get('port'), function () {
  console.log('IoT app run on port ' + app.get('port'));
});