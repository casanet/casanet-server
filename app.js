
// Project moduls 
var devices = require('./modules/devices');
var events = require('./modules/events');
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
app.use('/static', express.static('public')); // serve every static file in public folder
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

// Get all devices 
app.get('/devices', (req, res) => {
  devices.GetDevices((devices) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(devices));
  });
});

// Get device by id
app.get('/devices/:id', (req, res) => {
  devices.GetDevice(req.params.id, (device, err) => {
    if (err)
      res.statusCode = 503;
    res.send(device);
  });
});

// Change devices vale by id
app.put('/devices/:id', (req, res) => {
  var params = req.body;
  var value;
  try {
    value = JSON.parse(params.value);
  } catch (error) {
    if (params.type == 'switch') {
      value = params.value;
    } else {
      res.statusCode = 503;
      res.send('param value parsing error');
      return;
    }
  }

  devices.SetDeviceProperty(req.params.id, params.type, value, (err) => {
    if (err)
      res.statusCode = 503;
    res.send();
  });
});

// Events API

// Trigger event by its id
app.post('/events/invoke/:id', (req, res) => {
  events.InvokeEvent(req.params.id, (err) => {
    if (err)
      res.statusCode = 503;
    res.send()
  });
});

// Get all events
app.get('/events', (req, res) => {
  events.GetEvents((events, err) => {
    if (err)
      res.statusCode = 503;
    res.send(events)
  });
});

// Send new event
app.post('/events', (req, res) => {
  var params = req.body;

  var name = params.name;
  var actions = params.actions;

  var hasError = false;

  // chack params
  try {
    var actions = JSON.parse(actions);
    hasError = !events.ActionsValidation(actions);
  } catch (error) {
    hasError = true;
  }

  if (hasError) {
    res.statusCode = 503;
    res.send('params errer');
    return;
  }

  events.CreateEvent(name, actions, (err) => {
    if (err)
      res.statusCode = 503;
    res.send()
  });
});

// change event 
app.put('/events/:id', (req, res) => {
  var params = req.body;

  var name = params.name;
  var actions = params.actions;

  var hasError = false;

  // check params
  try {
    var actions = JSON.parse(actions);
    hasError = !events.ActionsValidation(actions);
  } catch (error) {
    hasError = true;
  }

  if (hasError) {
    res.statusCode = 503;
    res.send('params errer');
    return;
  }

  events.EditEvent(req.params.id, name, actions, (err) => {
    if (err)
      res.statusCode = 503;
    res.send()
  });
});

// delete event by its id
app.delete('/events/:id', function (req, res) {
  events.DeleteEvent(req.params.id, (err) => {
    if (err)
      res.statusCode = 503;
    res.send()
  });
});


// Refresh data API (rescan lan)

// Refresh switchers and then get them
app.post('/refresh', function (req, res) {
  devices.RefreshDevicesData((err) => {
    if (err)
      res.statusCode = 503;
    res.send();
  });
});

// Server send event (SSE) Area

// Init the sse objects
var devicesSse = new SSE(['init'], { isSerialized: true });

// SSE resuest for switchers state federation
app.get('/devices-feed', devicesSse.init);

// Registar devices push updates  
devices.UpdateChangesEventRegistar((id, data) => {
  devicesSse.send({ 'deviceID': id, 'data': data });
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


