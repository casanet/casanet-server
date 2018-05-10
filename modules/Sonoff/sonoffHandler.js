
var sonoffServer = require('./sonoffConfig.json');

var request = require('request');
var requestUrl = 'http://' + sonoffServer.serverIP + ':' + sonoffServer.serverPort + '/devices/';

var ChangeState = function (device, state, next) {
    request(requestUrl + device.token + '/' + state, function (error, response, body) {
        next(!error && response.statusCode == 200 ? null :'Body: ' + body + ' Error ' + error);
    });
};

var GetState = function (device, next) {
    request(requestUrl + device.token + '/status', function (error, response, body) {
        next(body == '1' ? 'on' : body == '0' ?'off' : 'error' , error);
    });
    //next(isSuccess ? (data.indexOf('True') != -1 ? 'on' : 'off') : 'error', isSuccess ? null : 'error: ' + err + ' ' + data);
};

module.exports = {
    GetState: GetState,
    ChangeState: ChangeState
};