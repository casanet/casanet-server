"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
/* tslint:disable */
const tsoa_1 = require("tsoa");
const feedController_1 = require("./../controllers/feedController");
const forwardAuthController_1 = require("./../controllers/forwardAuthController");
const forwardingController_1 = require("./../controllers/forwardingController");
const localServersController_1 = require("./../controllers/localServersController");
const administrationAuthController_1 = require("./../controllers/administrationAuthController");
const administrationUsersController_1 = require("./../controllers/administrationUsersController");
const managementAssetsController_1 = require("./../controllers/managementAssetsController");
const staticAssetsController_1 = require("./../controllers/staticAssetsController");
const channelsController_1 = require("./../controllers/channelsController");
const authenticationExtend_1 = require("./../security/authenticationExtend");
const models = {
    "LocalNetworkDevice": {
        "properties": {
            "name": { "dataType": "string" },
            "mac": { "dataType": "string", "required": true },
            "vendor": { "dataType": "string" },
            "ip": { "dataType": "string" },
        },
    },
    "MinionDevice": {
        "properties": {
            "pysicalDevice": { "ref": "LocalNetworkDevice", "required": true },
            "brand": { "dataType": "string", "required": true },
            "model": { "dataType": "string", "required": true },
            "token": { "dataType": "string" },
            "deviceId": { "dataType": "string" },
        },
    },
    "Toggle": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
        },
    },
    "Switch": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
        },
    },
    "Roller": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "direction": { "dataType": "enum", "enums": ["up", "down"], "required": true },
        },
    },
    "Cleaner": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "mode": { "dataType": "enum", "enums": ["dock", "clean"], "required": true },
            "fanSpeed": { "dataType": "enum", "enums": ["low", "med", "high", "auto"], "required": true },
        },
    },
    "AirConditioning": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "temperature": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 16 }, "maximum": { "value": 30 }, "isInt": { "errorMsg": "true" } } },
            "mode": { "dataType": "enum", "enums": ["hot", "cold", "dry", "auto"], "required": true },
            "fanStrength": { "dataType": "enum", "enums": ["low", "med", "high", "auto"], "required": true },
        },
    },
    "Light": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "brightness": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 1 }, "maximum": { "value": 100 }, "isInt": { "errorMsg": "true" } } },
        },
    },
    "TemperatureLight": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "brightness": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 1 }, "maximum": { "value": 100 }, "isInt": { "errorMsg": "true" } } },
            "temperature": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 1 }, "maximum": { "value": 100 }, "isInt": { "errorMsg": "true" } } },
        },
    },
    "ColorLight": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "brightness": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 1 }, "maximum": { "value": 100 }, "isInt": { "errorMsg": "true" } } },
            "temperature": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 1 }, "maximum": { "value": 100 }, "isInt": { "errorMsg": "true" } } },
            "red": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 0 }, "maximum": { "value": 255 }, "isInt": { "errorMsg": "true" } } },
            "green": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 0 }, "maximum": { "value": 255 }, "isInt": { "errorMsg": "true" } } },
            "blue": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 0 }, "maximum": { "value": 255 }, "isInt": { "errorMsg": "true" } } },
        },
    },
    "MinionStatus": {
        "properties": {
            "toggle": { "ref": "Toggle" },
            "switch": { "ref": "Switch" },
            "roller": { "ref": "Roller" },
            "cleaner": { "ref": "Cleaner" },
            "airConditioning": { "ref": "AirConditioning" },
            "light": { "ref": "Light" },
            "temperatureLight": { "ref": "TemperatureLight" },
            "colorLight": { "ref": "ColorLight" },
        },
    },
    "Minion": {
        "properties": {
            "minionId": { "dataType": "string" },
            "name": { "dataType": "string", "required": true },
            "device": { "ref": "MinionDevice", "required": true },
            "isProperlyCommunicated": { "dataType": "boolean" },
            "minionStatus": { "ref": "MinionStatus", "required": true },
            "minionType": { "dataType": "enum", "enums": ["toggle", "switch", "roller", "cleaner", "airConditioning", "light", "temperatureLight", "colorLight"], "required": true },
            "minionAutoTurnOffMS": { "dataType": "double" },
        },
    },
    "MinionFeed": {
        "properties": {
            "event": { "dataType": "enum", "enums": ["created", "update", "removed"], "required": true },
            "minion": { "ref": "Minion", "required": true },
        },
    },
    "ErrorResponse": {
        "properties": {
            "responseCode": { "dataType": "double", "required": true },
            "message": { "dataType": "string" },
        },
    },
    "DailySunTrigger": {
        "properties": {
            "days": { "dataType": "array", "array": { "dataType": "enum", "enums": ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] }, "required": true },
            "durationMinutes": { "dataType": "double", "required": true },
            "sunTrigger": { "dataType": "enum", "enums": ["sunrise", "sunset"], "required": true },
        },
    },
    "DailyTimeTrigger": {
        "properties": {
            "days": { "dataType": "array", "array": { "dataType": "enum", "enums": ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] }, "required": true },
            "hour": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 0 }, "maximum": { "value": 23 }, "isInt": { "errorMsg": "true" } } },
            "minutes": { "dataType": "integer", "required": true, "validators": { "minimum": { "value": 0 }, "maximum": { "value": 59 }, "isInt": { "errorMsg": "true" } } },
        },
    },
    "OnceTiming": {
        "properties": {
            "date": { "dataType": "double", "required": true },
        },
    },
    "TimeoutTiming": {
        "properties": {
            "startDate": { "dataType": "double", "required": true },
            "durationInMimutes": { "dataType": "double", "required": true },
        },
    },
    "TimingProperties": {
        "properties": {
            "dailySunTrigger": { "ref": "DailySunTrigger" },
            "dailyTimeTrigger": { "ref": "DailyTimeTrigger" },
            "once": { "ref": "OnceTiming" },
            "timeout": { "ref": "TimeoutTiming" },
        },
    },
    "Timing": {
        "properties": {
            "timingId": { "dataType": "string", "required": true },
            "timingName": { "dataType": "string", "required": true },
            "triggerOperationId": { "dataType": "string", "required": true },
            "isActive": { "dataType": "boolean", "required": true },
            "timingType": { "dataType": "enum", "enums": ["dailySunTrigger", "dailyTimeTrigger", "once", "timeout"], "required": true },
            "timingProperties": { "ref": "TimingProperties", "required": true },
        },
    },
    "OperationResult": {
        "properties": {
            "minionId": { "dataType": "string", "required": true },
            "error": { "ref": "ErrorResponse" },
        },
    },
    "TimingFeed": {
        "properties": {
            "timing": { "ref": "Timing", "required": true },
            "results": { "dataType": "array", "array": { "ref": "OperationResult" }, "required": true },
        },
    },
    "LocalServerInfo": {
        "properties": {
            "localServerId": { "dataType": "string", "required": true },
            "displayName": { "dataType": "string", "required": true },
        },
    },
    "LoginLocalServer": {
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
            "localServerId": { "dataType": "string" },
        },
    },
    "LocalServer": {
        "properties": {
            "localServerId": { "dataType": "string", "required": true },
            "displayName": { "dataType": "string", "required": true },
            "macAddress": { "dataType": "string", "required": true },
            "validUsers": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "connectionStatus": { "dataType": "boolean" },
        },
    },
    "Login": {
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
    },
    "User": {
        "properties": {
            "displayName": { "dataType": "string" },
            "email": { "dataType": "string", "required": true },
            "sessionTimeOutMS": { "dataType": "double", "required": true },
            "password": { "dataType": "string" },
            "ignoreTfa": { "dataType": "boolean", "required": true },
            "scope": { "dataType": "enum", "enums": ["adminAuth", "userAuth", "iftttAuth"], "required": true },
        },
    },
};
const validationService = new tsoa_1.ValidationService(models);
function RegisterRoutes(app) {
    app.get('/API/feed/minions', authenticateMiddleware([{ "userAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new feedController_1.FeedController();
        const promise = controller.getMinionsFeed.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/feed/timings', authenticateMiddleware([{ "userAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new feedController_1.FeedController();
        const promise = controller.getTimingFeed.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/auth/login', function (request, response, next) {
        const args = {
            request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            login: { "in": "body", "name": "login", "required": true, "ref": "LoginLocalServer" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new forwardAuthController_1.ForwardAuthController();
        const promise = controller.loginDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/auth/login/tfa', function (request, response, next) {
        const args = {
            request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            login: { "in": "body", "name": "login", "required": true, "ref": "LoginLocalServer" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new forwardAuthController_1.ForwardAuthController();
        const promise = controller.loginTfaDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/auth/logout', authenticateMiddleware([{ "userAuth": [] }, { "adminAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new forwardAuthController_1.ForwardAuthController();
        const promise = controller.logoutDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/API/ifttt/trigger/**/*', authenticateMiddleware([{ "iftttAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new forwardingController_1.ForwardingController();
        const promise = controller.apiForwardingIftttDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/API/**/*', authenticateMiddleware([{ "userAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new forwardingController_1.ForwardingController();
        const promise = controller.apiForwardingDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/servers', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new localServersController_1.LocalServersController();
        const promise = controller.getLocalServers.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/servers/:localServerId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new localServersController_1.LocalServersController();
        const promise = controller.getLocalServer.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/servers', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            localServer: { "in": "body", "name": "localServer", "required": true, "ref": "LocalServer" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new localServersController_1.LocalServersController();
        const promise = controller.addLocalServer.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.put('/API/servers/:localServerId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
            localServer: { "in": "body", "name": "localServer", "required": true, "ref": "LocalServer" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new localServersController_1.LocalServersController();
        const promise = controller.updateLocalServer.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.delete('/API/servers/:localServerId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new localServersController_1.LocalServersController();
        const promise = controller.deleteLocalServer.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/servers/auth/:localServerId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new localServersController_1.LocalServersController();
        const promise = controller.generateAuthKeyLocalServer.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/administration/auth/login', function (request, response, next) {
        const args = {
            request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            login: { "in": "body", "name": "login", "required": true, "ref": "Login" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationAuthController_1.AdministrationAuthController();
        const promise = controller.administrationLoginDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/administration/auth/login/tfa', function (request, response, next) {
        const args = {
            request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            login: { "in": "body", "name": "login", "required": true, "ref": "Login" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationAuthController_1.AdministrationAuthController();
        const promise = controller.administrationLoginTfaDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/administration/auth/logout', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationAuthController_1.AdministrationAuthController();
        const promise = controller.administrationLogoutDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/administration/users/profile', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationUsersController_1.AdministrationUsersController();
        const promise = controller.getProfile.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/administration/users', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationUsersController_1.AdministrationUsersController();
        const promise = controller.getUsers.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/administration/users/:adminId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            adminId: { "in": "path", "name": "adminId", "required": true, "dataType": "string" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationUsersController_1.AdministrationUsersController();
        const promise = controller.getUser.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.put('/API/administration/users/:adminId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            adminId: { "in": "path", "name": "adminId", "required": true, "dataType": "string" },
            user: { "in": "body", "name": "user", "required": true, "ref": "User" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationUsersController_1.AdministrationUsersController();
        const promise = controller.setUser.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.delete('/API/administration/users/:adminId', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            adminId: { "in": "path", "name": "adminId", "required": true, "dataType": "string" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationUsersController_1.AdministrationUsersController();
        const promise = controller.deleteUser.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.post('/API/administration/users', authenticateMiddleware([{ "adminAuth": [] }]), function (request, response, next) {
        const args = {
            user: { "in": "body", "name": "user", "required": true, "ref": "User" },
        };
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new administrationUsersController_1.AdministrationUsersController();
        const promise = controller.createUser.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/management/**/*', function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new managementAssetsController_1.ManagementsAssetsController();
        const promise = controller.getManagementsAssets.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/static/**/*', function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new staticAssetsController_1.StaticsAssetsController();
        const promise = controller.getStaticsAssets.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    app.get('/API/channels', function (request, response, next) {
        const args = {};
        let validatedArgs = [];
        try {
            validatedArgs = getValidatedArgs(args, request);
        }
        catch (err) {
            response.status(422).send({
                responseCode: 1422,
                message: JSON.stringify(err.fields),
            });
            return;
        }
        const controller = new channelsController_1.ChannelsController();
        const promise = controller.connectToRemoteViaWsDocumentation.apply(controller, validatedArgs);
        promiseHandler(controller, promise, response, next);
    });
    function authenticateMiddleware(security = []) {
        return (request, _response, next) => {
            const succeed = function (user) {
                request['user'] = user;
                next();
            };
            const fail = async function (error) {
                _response.status(401).send({
                    responseCode: 1401,
                });
            };
            const scopes = [];
            try {
                for (const scop of security) {
                    scopes.push(Object.keys(scop)[0]);
                }
            }
            catch (error) {
            }
            authenticationExtend_1.expressAuthentication(request, scopes)
                .then(succeed)
                .catch(fail);
        };
    }
    function isController(object) {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }
    function promiseHandler(controllerObj, promise, response, next) {
        return Promise.resolve(promise)
            .then((data) => {
            let statusCode;
            if (isController(controllerObj)) {
                const headers = controllerObj.getHeaders();
                Object.keys(headers).forEach((name) => {
                    response.set(name, headers[name]);
                });
                statusCode = controllerObj.getStatus();
            }
            if (data || data === false) { // === false allows boolean result
                response.status(statusCode || 200).json(data);
            }
            else {
                response.status(statusCode || 204).end();
            }
        })
            .catch(async (error) => {
            /**
             * If error is from TSOA sent it back to client (it's part of API)
             * Else throw it back.
             */
            try {
                const cleanError = {
                    responseCode: error.responseCode,
                    message: error.message
                };
                if (typeof cleanError.responseCode !== 'number') {
                    throw new Error('invalid error schema');
                }
                response.status(500).send(cleanError);
            }
            catch (error) {
                response.status(500).send({
                    responseCode: 1500,
                    message: 'unknown error',
                });
            }
        });
    }
    function getValidatedArgs(args, request) {
        const fieldErrors = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors);
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors);
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors);
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, name + '.');
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.');
            }
        });
        if (Object.keys(fieldErrors).length > 0) {
            throw new tsoa_1.ValidateError(fieldErrors, '');
        }
        return values;
    }
}
exports.RegisterRoutes = RegisterRoutes;
//# sourceMappingURL=routes.js.map