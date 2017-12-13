// Init angular app 
var IoTApp = angular.module("IoTApp", ['rzModule', 'ui.bootstrap', 'ngRoute']);

// Services
IoTApp.service('updatesService', ['$http', function (http) {

    // Switch update
    this.eventsArray = [];
    var methods = this.eventsArray;
    this.GivCallbackToListen = (method) => {
        methods.push(method);
    }

    // Listen to event of 
    var es = new EventSource('/devices-feed');

    es.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data == 'init')
            return;
        console.log('Device: ' + data.deviceID + ' update');

        methods.forEach(function (item, index) {
            item(data);
        });

    };

    var timinges = new EventSource('/timing-triggered-feed');

    timinges.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data == 'init')
            return;
        // alert('timing activeted , row message data: '  + event.data);
        console.log('timing activeted , row message data: ' + event.data)
        swal({
            title: "Timing Activated!",
            timer: 60000
        });
    };
}]);

// Controller defnition
IoTApp.controller('indexCtrl', function ($scope) {
    // For next use
});

IoTApp.controller('mainCtrl', function ($scope, $http, updatesService) {
    $scope.onMouseUpCallbacks = [];

    $(document).ready(function () {


        document.body.ontouchend = function () {
            $scope.onMouseUpCallbacks.forEach((method) => {
                method();
            });
        }

        document.body.onmouseup = function () {
            $scope.onMouseUpCallbacks.forEach((method) => {
                method();
            });
        }
    });

    $scope.CreateAcTempSlider = (device) => {
        device.acTempSlider = {
            value: device.ac.temp,
            options: {
                floor: 16,
                ceil: 30,
                showSelectionBar: true,
                translate: function (value) {
                    return value + '°';
                },
                id: device.deviceID + 'acTemp',
                onChange: function (id) {
                    device.ac.temp = device.acTempSlider.value;

                    device.acTempSlider.hasChanged = true;
                },
                getPointerColor: function (value) {
                    return '#121540';
                },
                getSelectionBarColor: function (value) {
                    return '#121571';
                }
            }
        }
        $scope.onMouseUpCallbacks.push(() => {
            if (!(device.acTempSlider.hasChanged))
                return;
            device.acTempSlider.hasChanged = false;
            // TODO send to API
            $scope.SetAC(device);
        })
    }

    $scope.CreateBrightnessSlider = (device) => {
        device.brightnessSlider = {
            value: device.bright,
            options: {
                floor: 1,
                ceil: 100,
                showSelectionBar: true,
                translate: function (value) {
                    return value + '%';
                },
                id: device.deviceID + 'brightness',
                onChange: function (id) {
                    device.bright = device.brightnessSlider.value;
                    device.brightnessSlider.hasChanged = true;
                },
                getPointerColor: function (value) {
                    return '#ffcc00';
                },
                getSelectionBarColor: function (value) {
                    if (value <= 30)
                        return '#fff0b3';
                    if (value <= 60)
                        return '#ffe680';
                    if (value <= 90)
                        return '#ffdb4d';
                    return '#ffd11a';
                }
            }
        }
        $scope.onMouseUpCallbacks.push(() => {
            if (!(device.brightnessSlider.hasChanged))
                return;
            device.brightnessSlider.hasChanged = false;
            // send to API
            $scope.SetLight(device, 'light');
        })
    }

    $scope.CreateWhiteTempSlider = (device) => {
        device.whiteTempSlider = {
            value: device.white_temp,
            options: {
                floor: 1,
                ceil: 100,
                showSelectionBar: true,
                translate: function (value) {
                    return '-' + value + '%';
                },
                id: device.deviceID + 'whitetemp',
                onChange: function (id) {
                    device.white_temp = device.whiteTempSlider.value;
                    device.whiteTempSlider.hasChanged = true;
                },
                getPointerColor: function (value) {
                    return '#ff9900';
                },
                getSelectionBarColor: function (value) {
                    if (value <= 30)
                        return '#ffebcc';
                    if (value <= 60)
                        return '#ffd699';
                    if (value <= 90)
                        return '#ffc266';
                    return '#ffad33';
                }
            }
        }
        $scope.onMouseUpCallbacks.push(() => {
            if (!(device.whiteTempSlider.hasChanged))
                return;
            device.whiteTempSlider.hasChanged = false;
            // TODO send to API
            $scope.SetLight(device, 'white_temp');
        })
    }

    $scope.CreateColorSlider = (device) => {
        device.colorSlider = {};

        device.redSlider = {
            value: device.light_color.red,
            options: {
                floor: 1,
                ceil: 255,
                vertical: true,
                showSelectionBar: true,
                translate: function (value) {
                    return '';
                },
                id: device.deviceID + 'red',
                onChange: function (id) {
                    device.colorSlider.hasChanged = true;
                    device.light_color.red = device.redSlider.value;
                },
                getPointerColor: function (value) {
                    return 'red';
                },
                getSelectionBarColor: function (value) {
                    return 'red';
                }
            }
        }

        device.greenSlider = {
            value: device.light_color.green,
            options: {
                floor: 1,
                ceil: 255,
                vertical: true,
                showSelectionBar: true,
                translate: function (value) {
                    return '';
                },
                id: device.deviceID + 'green',
                onChange: function (id) {
                    device.colorSlider.hasChanged = true;
                    device.light_color.green = device.greenSlider.value;
                },
                getPointerColor: function (value) {
                    return 'green';
                },
                getSelectionBarColor: function (value) {
                    return 'green';
                }
            }
        }

        device.blueSlider = {
            value: device.light_color.blue,
            options: {
                floor: 1,
                ceil: 255,
                vertical: true,
                showSelectionBar: true,
                translate: function (value) {
                    return '';
                },
                id: device.deviceID + 'blue',
                onChange: function (id) {
                    device.colorSlider.hasChanged = true;
                    device.light_color.blue = device.blueSlider.value;
                },
                getPointerColor: function (value) {
                    return 'blue';
                },
                getSelectionBarColor: function (value) {
                    return 'blue';
                }
            }
        }
        $scope.onMouseUpCallbacks.push(() => {
            if (!(device.colorSlider.hasChanged))
                return;
            device.colorSlider.hasChanged = false;
            // TODO send to API
            $scope.SetLight(device, 'light_color');
        })
    }


    $scope.GetDeviceClass = (device) => {
        if (device.isSwitch)
            return '';
        else if (device.isAC)
            return 'card-ac';

        var lightClass = '';
        if (device.isBrightness)
            lightClass += ' card card-brightness ';
        if (device.isWhiteTemp)
            lightClass += ' card-white-color ';
        if (device.isColor)
            lightClass += ' card-color ';
        return lightClass;
    }
    /// END


    $scope.devices = [];

    // updates
    updatesService.GivCallbackToListen((data) => {
        $scope.devices.forEach((item, index) => {
            if (item.deviceID == data.deviceID) {

                item.state = data.data.state;

                if (item.isBrightness) {
                    item.bright = data.data.bright;
                    item.brightnessSlider.value = item.bright;
                }

                if (item.isWhiteTemp) {
                    item.white_temp = data.data.white_temp;
                    item.whiteTempSlider.value = item.white_temp;
                }

                if (item.isColor) {
                    item.light_color = data.data.light_color;
                    item.redSlider.value = item.light_color.red;
                    item.greenSlider.value = item.light_color.green;
                    item.blueSlider.value = item.light_color.blue;
                }

                if (item.isAC) {
                    item.ac = data.data.ac;
                    item.acTempSlider.value = item.ac.temp;
                }

                $scope.$apply();
            }
        })
    });

    $scope.GetDevices = function (dontCleanError) {
        $scope.devices = [];
        if (!dontCleanError)
            $scope.error = "";
        $http({
            url: 'devices',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get devices successfully");
                Object.keys(response.data).forEach((key) => {
                    var device = response.data[key];
                    device.deviceID = key;

                    if (device.types.indexOf('ac') != -1) {
                        device.typeName = 'ac';
                        device.isAC = true;
                        $scope.CreateAcTempSlider(device);
                    }
                    else if (device.types.indexOf('light') != -1) {
                        device.typeName = 'light';
                        device.isBrightness = true;
                        $scope.CreateBrightnessSlider(device);
                        if (device.types.indexOf('white_temp') != -1) {
                            device.typeName = 'white_temp';
                            device.isWhiteTemp = true;
                            $scope.CreateWhiteTempSlider(device);
                        }
                        if (device.types.indexOf('light_color') != -1) {
                            device.typeName = 'light_color';
                            device.isColor = true;
                            $scope.CreateColorSlider(device);
                        }
                    } else {
                        device.isSwitch = true;
                    }
                    $scope.devices.push(device);
                });

            },
            function (response) { // optional
                $scope.ErrorResponse(response);
            });
    };

    $scope.GetDevices();

    $scope.SetState = function (device) {

        device.state = device.state == 'on' ? 'off' : 'on';

        $http({
            url: 'devices/' + device.deviceID,
            method: "PUT",
            data: { 'type': 'switch', 'value': device.state }
        })
            .then(function (response) {
                console.log("change device successfully");
                $scope.error = "";
            },
            function (response) { // optional
                $scope.ErrorResponse(response);
            });
    };

    $scope.SetLight = (device, PropToChange) => {

        $http({
            url: 'devices/' + device.deviceID,
            method: "PUT",
            data: { 'type': PropToChange, 'value': PropToChange == 'light' ? device['bright'] : device[PropToChange] }
        })
            .then(function (response) {
                $scope.error = "";
                console.log("change device light successfully");
            },
            function (response) {
                $scope.ErrorResponse(response);
            });
    }

    $scope.ErrorResponse = (response) => {

        if (response.status != 403)
            $scope.GetDevices(true);
        swal({
            title: "Error with requst action",
            text: response.data,
            type: "warning",
            timer: 60000
        });
        console.error(response.data);
    }

    $scope.SetAC = (device) => {

        $http({
            url: 'devices/' + device.deviceID,
            method: "PUT",
            data: { 'type': 'ac', 'value': device.ac }
        })
            .then(function (response) {
                $scope.error = "";
                console.log("change device ac successfully");
            },
            function (response) { // optional
                $scope.ErrorResponse(response);
            });

    }

    $scope.RefreshData = () => {

        $scope.devices = [];
        $http({
            url: 'refresh',
            method: "POST"
        })
            .then(function (response) {
                console.log("devices refreshd successfully");
                $scope.GetDevices();
            },
            function (response) { // optional
                $scope.ErrorResponse(response);
            });
    }

    $scope.ShowDetails = (device) => {
        swal(device.name, 'ID: ' + device.deviceID  + '\nBRAND: ' + device.brand + '\nMODEL: ' + device.model + '\nMAC: ' + device.mac + '\nIP: ' + device.ip );
    }

    $scope.FullScreen = () => {
        document.documentElement.webkitRequestFullScreen();
    }

});

IoTApp.controller('loginCtrl', function ($scope, $http) {
    $scope.Login = function () {
        $scope.error = "";
        var data = { "userName": $scope.userName, "password": $scope.password }
        $http({
            url: 'login',
            method: "POST",
            data: data
        })
            .then(function (response) {
                console.log("login successfully");
                swal({
                    title: "Login successfully",
                    type: "success",
                    timer: 60000
                });
            },
            function (response) { // optional
                console.error("error in login");
                swal({
                    title: "Error in login",
                    text: "usename or password incorrect",
                    type: "warning",
                    timer: 60000
                });
            });
    };

    $scope.Logout = function (all) {
        $scope.error = "";
        $http({
            url: 'logout/' + (all ? 'all' : ''),
            method: "POST"
        })
            .then(function (response) {
                console.log("logout successfully");
                swal({
                    title: "Requst done",
                    type: "success",
                    timer: 60000
                });
            },
            function (response) { // optional
                console.error("error in logout");

                swal({
                    title: "Error in requst",
                    text: response.data,
                    type: "warning",
                    timer: 60000
                });
            });
    };
});

IoTApp.controller('timingsCtrl', function ($scope, $http) {
    $scope.SetTimingsAsLists = (timingsStruct) => {
        $scope.dailyTimings = [];
        $scope.onceTimings = [];
        $scope.timerTimings = [];
        $scope.GetActions((actions, err) => {
            Object.keys(timingsStruct).forEach((key) => {
                var currTiming = timingsStruct[key];
                currTiming.id = key;
                currTiming.triggerName = actions[currTiming.trigger].name;

                switch (currTiming.timingType) {
                    case "daily":
                        $scope.dailyTimings.push(currTiming);
                        break;
                    case "once":
                        $scope.onceTimings.push(currTiming);
                        break;
                    case "timer":
                        $scope.timerTimings.push(currTiming);
                        break;
                    default:
                        break;
                }
            });

        })
    };

    $scope.GetActions = function (callback) {

        $http({
            url: 'events',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get actions successfully");
                callback(response.data);
            },
            function (response) {
                callback({}, response);
            });
    };

    $scope.GetTimings = function () {

        $http({
            url: 'timings',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get timings successfully");
                $scope.SetTimingsAsLists(response.data);
            },
            function (response) {

            });
    };

    $scope.GetTimings();

    $scope.TuggelTimingActive = function (timing) {

        var newTiming = JSON.parse(JSON.stringify(timing));
        delete newTiming['id'];
        delete newTiming['triggerName'];
        newTiming['active'] = timing.active == 'on' ? 'off' : 'on';
        $http({
            url: 'timings/' + timing.id,
            method: 'PUT',
            data: newTiming
        })
            .then(function (response) {
                console.log("chnage timings active successfully");
                timing.active = newTiming['active'];

            },
            function (response) {

            });
    };

});

IoTApp.controller('actionsCtrl', function ($scope, $http) {
    $scope.GetActions = function () {
        $http({
            url: 'events',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get actions successfully");

                var temp = response.data;
                $scope.GetDevices((devices) => {

                    $scope.events = [];
                    Object.keys(temp).forEach((key) => {
                        var item = temp[key];
                        item.id = key;
                        item.actions.forEach((i) => {
                            if (i.deviceID in devices)
                                i.deviceName = devices[i.deviceID].name;
                            else
                                i.deviceName = i.deviceID + " - id not exist in devices";
                        })

                        $scope.events.push(item);
                    });

                });

            },
            function (response) {
            });
    };
    $scope.GetActions();

    $scope.GetDevices = function (callback) {

        $http({
            url: 'devices',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get devices successfully");
                callback(response.data);
            },
            function (response) {
                callback({}, response);
            });
    };

    $scope.RunEvent = function (event) {

        $http({
            url: 'events/invoke/' + event.id,
            method: 'POST'
        })
            .then(function (response) {
                console.log("event invoked successfully");
                swal({
                    title: "Event invoked successfully",
                    type: "success",
                    timer: 60000
                });
            },
            function (response) {
                console.log("error while event invoked");
                swal({
                    title: "Error while event invoked",
                    text: response.data,
                    type: "warning",
                    timer: 60000
                });
            });
    };

});

IoTApp.controller('logsCtrl', function ($scope, $http) {
    $scope.GetLogs = function () {
        $http({
            url: 'logs',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get logs successfully");
                $scope.logs = response.data;
            },
            function (response) {
            });
    };

    $scope.GetLogs();
    $scope.DateToString = (date) => {
        return new Date(date).toLocaleString();
    }
});

// // angular SPA routing definition
IoTApp.config(function ($routeProvider) {
    $routeProvider
        .when('/main', {
            templateUrl: '/static/view/main.html',
            controller: 'mainCtrl'
        }).when('/timings', {
            templateUrl: '/static/view/timings.html',
            controller: 'timingsCtrl'
        }).when('/actions', {
            templateUrl: '/static/view/actions.html',
            controller: 'actionsCtrl'
        }).when('/login', {
            templateUrl: '/static/view/login.html',
            controller: 'loginCtrl'
        }).when('/logs', {
            templateUrl: '/static/view/logs.html',
            controller: 'logsCtrl'
        }).when('/about', {
            templateUrl: '/static/view/about.html',
            controller: 'aboutCtrl'
        }).otherwise({
            redirectTo: '/main'
        });
});
