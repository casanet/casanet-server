
// Project moduls 
var devicesHandler = require('./modules/devices');
var eventsHandler = require('./modules/events');
var securityHandler = require('./modules/security');

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
  if (req.url == '/' ||
    req.url.indexOf('static') != -1 ||
    req.url == '/login' ||
    req.url == '/logout') { // it login logout or static file continue
    next();
    return;
  }
  securityHandler.CheckAccess(req, res, () => {
    next();
  });
})

// Server API routing

// Access API

// Login
// body should be { userName : 'theUserName', password : 'thePassword' } 
app.post('/login', function (req, res) {
  var params = req.body;
  securityHandler.CheckIn(req, params.userName, params.password, (result) => {
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
  securityHandler.CheckOut(req);
  res.send(`Logout seccessfuly`);
});

// RESTful API

// Devices API

// Get all devices 
app.get('/devices', (req, res) => {
  devicesHandler.GetDevices((devices, err) => {
    if (err)
      res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(!err ? JSON.stringify(devices) : err);
  });
});

// Get device by id
app.get('/devices/:id', (req, res) => {
  devicesHandler.GetDevice(req.params.id, (device, err) => {
    if (err)
      res.statusCode = 503;
    res.send(!err ? device : err);
  });
});

// Change devices value by id
app.put('/devices/:id', (req, res) => {
  var params = req.body;
  var value;
  try {
    if ((typeof params.value) == 'string')
      value = JSON.parse(params.value);
    else
      value = params.value;
  } catch (error) {
    if (params.type == 'switch') {
      value = params.value;
    } else {
      res.statusCode = 503;
      res.send('param value parsing error');
      return;
    }
  }

  devicesHandler.SetDeviceProperty(req.params.id, params.type, value, (err) => {
    if (err)
      res.statusCode = 503;
    res.send(err);
  });
});

// Events API

// Trigger event by its id
app.post('/events/invoke/:id', (req, res) => {
  eventsHandler.InvokeEvent(req.params.id, (err) => {
    if (err)
      res.statusCode = 503;
    res.send(err);
  });
});

// Get all events
app.get('/events', (req, res) => {
  eventsHandler.GetEvents((events, err) => {
    if (err)
      res.statusCode = 503;
    res.send(!err ? events : err)
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
    if ((typeof actions) == 'string')
      actions = JSON.parse(actions);

    hasError = !eventsHandler.ActionsValidation(actions);
  } catch (error) {
    hasError = true;
  }

  if (hasError) {
    res.statusCode = 503;
    res.send('params errer');
    return;
  }

  eventsHandler.CreateEvent(name, actions, (err) => {
    if (err)
      res.statusCode = 503;
    res.send(err)
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
    var actions = (typeof actions == 'string') ? JSON.parse(actions) : actions;
    hasError = !eventsHandler.ActionsValidation(actions);
  } catch (error) {
    hasError = true;
  }

  if (hasError) {
    res.statusCode = 503;
    res.send('params errer');
    return;
  }

  eventsHandler.EditEvent(req.params.id, name, actions, (err) => {
    if (err)
      res.statusCode = 503;
    res.send(err)
  });
});

// delete event by its id
app.delete('/events/:id', function (req, res) {
  eventsHandler.DeleteEvent(req.params.id, (err) => {
    if (err)
      res.statusCode = 503;
    res.send(err)
  });
});

// Refresh data of deviced (read angin all deviced status)
app.post('/refresh', function (req, res) {
  devicesHandler.RefreshDevicesData((err) => {
    if (err)
      res.statusCode = 503;
    res.send(err);
  });
});

// Server send event (SSE) Area

// Init the sse objects
var devicesSse = new SSE(['init'], { isSerialized: true });

// SSE object to get push notifications updates of devices changes
app.get('/devices-feed', devicesSse.init);

// Registar to devices push updates  
devicesHandler.UpdateChangesEventRegistar((id, data) => {
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
  console.log('home IoT server run on port ' + app.get('port'));
});


