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

    $scope.GetDevices = function (method) {
        $scope.error = "";
        $scope.devices = [];
        $http({
            url: 'devices',
            method: 'GET'
        })
            .then(function (response) {
                console.log("get devices successfully");
                $scope.error = "";
                Object.keys(response.data).forEach((key) => {
                    var device = response.data[key];
                    device.deviceID = key;
                    $scope.devices.push(device);
                });

            },
            function (response) { // optional
                if (response.status == 403) {
                    $scope.error += "\n Athontication error";
                    console.error("Athontication error");
                }
                $scope.error += '\n' + "error get devices";
                console.error("error get devices");
            });
    };

    $scope.GetDevices();


    $scope.SetState = function (device) {

        // change the status
        device.lastState = device.state;
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
                if (response.status == 403) {
                    console.error("Athontication error");
                    $scope.error += "\n Athontication error";
                    
                }
                console.error("error set devices switch");
                $scope.error += "\n error set devices switch";
                device.state = device.lastState;
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

    $scope.SetLight = (device) => {
        $http({
            url: 'devices/' + device.deviceID,
            method: "PUT",
            data: { 'type': 'light', 'value': device.light }
        })
            .then(function (response) {
                $scope.error = "";
                console.log("change device light successfully");
            },
            function (response) { // optional
                if (response.status == 403) {
                    $scope.error += "\n Athontication error";
                    
                    console.error("Athontication error");
                }
                
                $scope.error += "\n error set devices light";
                console.error("error set devices light");
            });

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
                if (response.status == 403) {
                    $scope.error += "\n Athontication error";
                    console.error("Athontication error");
                }
                    $scope.error += "\n error set devices ac";
                    console.error("error set devices ac");
            });

    }

    $scope.RefreshData = () => {
        $http({
            url: 'refresh',
            method: "POST"
        })
            .then(function (response) {
                console.log("devices refreshd successfully");
                $scope.error = "";
                $scope.GetDevices();
            },
            function (response) { // optional
                if (response.status == 403) {
                    $scope.error += "\n Athontication error";
                    console.error("Athontication error");
                }
                $scope.error += "\n error devices refresh";
                console.error("error devices refresh");
            });
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
            },
            function (response) { // optional
                console.error("error in login");
                $scope.error = "error in login";
            });
    };

    $scope.Logout = function () {
        $scope.error = "";
        $http({
            url: 'logout',
            method: "POST"
        })
            .then(function (response) {
                console.log("logout successfully");
            },
            function (response) { // optional
                console.error("error in logout");
                $scope.error = "error in logout";
            });
    };
});

IoTApp.controller('aboutCtrl', function ($scope) {
    // For next use
});

// // angular SPA routing definition
IoTApp.config(function ($routeProvider) {
    $routeProvider
        .when('/main', {
            templateUrl: '/static/view/main.html',
            controller: 'mainCtrl'
        }).when('/login', {
            templateUrl: '/static/view/login.html',
            controller: 'loginCtrl'
        }).when('/about', {
            templateUrl: '/static/view/about.html',
            controller: 'aboutCtrl'
        }).otherwise({
            redirectTo: '/main'
        });
});
