// Init angular app 
var IoTApp = angular.module("IoTApp", ['ngRoute']);

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
    $scope.devices = [];

    // updates
    updatesService.GivCallbackToListen((data) => {
        $scope.devices.forEach((item, index) => {
            if (item.deviceID == data.deviceID) {
                $scope.devices[index] = data.data;
                $scope.devices[index].deviceID = data.deviceID;
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

    $scope.GetFiltedDevices = (filterByType) => {
        var l = [];
        $scope.devices.forEach((d) => {
            if (d.types.indexOf(filterByType) != -1 &&
                d.state != 'error')
                l.push(d);
        })
        return l;
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
