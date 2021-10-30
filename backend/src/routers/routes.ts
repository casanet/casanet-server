/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/authController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BackupController } from './../controllers/backupController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DevicesController } from './../controllers/devicesController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FeedController } from './../controllers/feedController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { IftttController } from './../controllers/iftttController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LogsController } from './../controllers/logsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MinionsController } from './../controllers/minionsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OperationsController } from './../controllers/operationsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RfController } from './../controllers/radioFrequencyController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RemoteConnectionController } from './../controllers/remoteConnectionController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TimingsController } from './../controllers/timingsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from './../controllers/usersController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VersionsController } from './../controllers/versionsController';
import { expressAuthentication } from './../security/authentication';
// @ts-ignore - no great way to install types from subpackage
const promiseAny = require('promise.any');
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "responseCode": {"dataType":"double","required":true},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Login": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "localServerId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginMfa": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "mfa": {"dataType":"string","required":true},
            "localServerId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LocalNetworkDevice": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "mac": {"dataType":"string","required":true},
            "vendor": {"dataType":"string"},
            "ip": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionTypes": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["toggle"]},{"dataType":"enum","enums":["switch"]},{"dataType":"enum","enums":["roller"]},{"dataType":"enum","enums":["cleaner"]},{"dataType":"enum","enums":["airConditioning"]},{"dataType":"enum","enums":["light"]},{"dataType":"enum","enums":["temperatureLight"]},{"dataType":"enum","enums":["colorLight"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeviceKind": {
        "dataType": "refObject",
        "properties": {
            "brand": {"dataType":"string","required":true},
            "model": {"dataType":"string","required":true},
            "minionsPerDevice": {"dataType":"double","required":true},
            "isTokenRequired": {"dataType":"boolean","required":true},
            "isIdRequired": {"dataType":"boolean","required":true},
            "supportedMinionType": {"ref":"MinionTypes","required":true},
            "isRecordingSupported": {"dataType":"boolean","required":true},
            "isFetchCommandsAvailable": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeedEvent": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["created"]},{"dataType":"enum","enums":["update"]},{"dataType":"enum","enums":["removed"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionDevice": {
        "dataType": "refObject",
        "properties": {
            "pysicalDevice": {"ref":"LocalNetworkDevice","required":true},
            "brand": {"dataType":"string","required":true},
            "model": {"dataType":"string","required":true},
            "token": {"dataType":"string"},
            "deviceId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SwitchOptions": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["on"]},{"dataType":"enum","enums":["off"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Toggle": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Switch": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RollerDirection": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["up"]},{"dataType":"enum","enums":["down"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Roller": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
            "direction": {"ref":"RollerDirection","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CleanerMode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["dock"]},{"dataType":"enum","enums":["clean"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FanStrengthOptions": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["low"]},{"dataType":"enum","enums":["med"]},{"dataType":"enum","enums":["high"]},{"dataType":"enum","enums":["auto"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Cleaner": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
            "mode": {"ref":"CleanerMode","required":true},
            "fanSpeed": {"ref":"FanStrengthOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ACModeOptions": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["hot"]},{"dataType":"enum","enums":["cold"]},{"dataType":"enum","enums":["dry"]},{"dataType":"enum","enums":["auto"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AirConditioning": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
            "temperature": {"dataType":"integer","required":true,"validators":{"minimum":{"value":16},"maximum":{"value":30},"isInt":{"errorMsg":"true"}}},
            "mode": {"ref":"ACModeOptions","required":true},
            "fanStrength": {"ref":"FanStrengthOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Light": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
            "brightness": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1},"maximum":{"value":100},"isInt":{"errorMsg":"true"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TemperatureLight": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
            "brightness": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1},"maximum":{"value":100},"isInt":{"errorMsg":"true"}}},
            "temperature": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1},"maximum":{"value":100},"isInt":{"errorMsg":"true"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ColorLight": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"SwitchOptions","required":true},
            "brightness": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1},"maximum":{"value":100},"isInt":{"errorMsg":"true"}}},
            "temperature": {"dataType":"integer","required":true,"validators":{"minimum":{"value":1},"maximum":{"value":100},"isInt":{"errorMsg":"true"}}},
            "red": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0},"maximum":{"value":255},"isInt":{"errorMsg":"true"}}},
            "green": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0},"maximum":{"value":255},"isInt":{"errorMsg":"true"}}},
            "blue": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0},"maximum":{"value":255},"isInt":{"errorMsg":"true"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionStatus": {
        "dataType": "refObject",
        "properties": {
            "toggle": {"ref":"Toggle"},
            "switch": {"ref":"Switch"},
            "roller": {"ref":"Roller"},
            "cleaner": {"ref":"Cleaner"},
            "airConditioning": {"ref":"AirConditioning"},
            "light": {"ref":"Light"},
            "temperatureLight": {"ref":"TemperatureLight"},
            "colorLight": {"ref":"ColorLight"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CalibrationMode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["LOCK_ON"]},{"dataType":"enum","enums":["LOCK_OFF"]},{"dataType":"enum","enums":["SHABBAT"]},{"dataType":"enum","enums":["AUTO"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionCalibrate": {
        "dataType": "refObject",
        "properties": {
            "calibrationCycleMinutes": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0},"isInt":{"errorMsg":"true"}}},
            "calibrationMode": {"ref":"CalibrationMode","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Minion": {
        "dataType": "refObject",
        "properties": {
            "minionId": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "device": {"ref":"MinionDevice","required":true},
            "isProperlyCommunicated": {"dataType":"boolean"},
            "minionStatus": {"ref":"MinionStatus","required":true},
            "minionType": {"ref":"MinionTypes","required":true},
            "minionAutoTurnOffMS": {"dataType":"double"},
            "calibration": {"ref":"MinionCalibrate"},
            "room": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionFeed": {
        "dataType": "refObject",
        "properties": {
            "event": {"ref":"FeedEvent","required":true},
            "minion": {"ref":"Minion","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OperationActivity": {
        "dataType": "refObject",
        "properties": {
            "minionId": {"dataType":"string","required":true},
            "minionStatus": {"ref":"MinionStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimingTypes": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["dailySunTrigger"]},{"dataType":"enum","enums":["dailyTimeTrigger"]},{"dataType":"enum","enums":["once"]},{"dataType":"enum","enums":["timeout"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SunTriggerOptions": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["sunrise"]},{"dataType":"enum","enums":["sunset"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DaysOptions": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["sunday"]},{"dataType":"enum","enums":["monday"]},{"dataType":"enum","enums":["tuesday"]},{"dataType":"enum","enums":["wednesday"]},{"dataType":"enum","enums":["thursday"]},{"dataType":"enum","enums":["friday"]},{"dataType":"enum","enums":["saturday"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailySunTrigger": {
        "dataType": "refObject",
        "properties": {
            "days": {"dataType":"array","array":{"dataType":"refAlias","ref":"DaysOptions"},"required":true},
            "durationMinutes": {"dataType":"double","required":true},
            "sunTrigger": {"ref":"SunTriggerOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DailyTimeTrigger": {
        "dataType": "refObject",
        "properties": {
            "days": {"dataType":"array","array":{"dataType":"refAlias","ref":"DaysOptions"},"required":true},
            "hour": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0},"maximum":{"value":23},"isInt":{"errorMsg":"true"}}},
            "minutes": {"dataType":"integer","required":true,"validators":{"minimum":{"value":0},"maximum":{"value":59},"isInt":{"errorMsg":"true"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OnceTiming": {
        "dataType": "refObject",
        "properties": {
            "date": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeoutTiming": {
        "dataType": "refObject",
        "properties": {
            "startDate": {"dataType":"double","required":true},
            "durationInMinutes": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimingProperties": {
        "dataType": "refObject",
        "properties": {
            "dailySunTrigger": {"ref":"DailySunTrigger"},
            "dailyTimeTrigger": {"ref":"DailyTimeTrigger"},
            "once": {"ref":"OnceTiming"},
            "timeout": {"ref":"TimeoutTiming"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Timing": {
        "dataType": "refObject",
        "properties": {
            "timingId": {"dataType":"string","required":true},
            "timingName": {"dataType":"string"},
            "triggerOperationId": {"dataType":"string"},
            "triggerDirectAction": {"ref":"OperationActivity"},
            "isActive": {"dataType":"boolean","required":true},
            "timingType": {"ref":"TimingTypes","required":true},
            "timingProperties": {"ref":"TimingProperties","required":true},
            "lockStatus": {"dataType":"boolean"},
            "shabbatMode": {"dataType":"boolean"},
            "overrideLock": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OperationResult": {
        "dataType": "refObject",
        "properties": {
            "minionId": {"dataType":"string","required":true},
            "error": {"ref":"ErrorResponse"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimingFeed": {
        "dataType": "refObject",
        "properties": {
            "timing": {"ref":"Timing","required":true},
            "results": {"dataType":"array","array":{"dataType":"refObject","ref":"OperationResult"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IftttIntegrationSettings": {
        "dataType": "refObject",
        "properties": {
            "apiKey": {"dataType":"string"},
            "enableIntegration": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IftttRawActionTriggered": {
        "dataType": "refObject",
        "properties": {
            "apiKey": {"dataType":"string","required":true},
            "localMac": {"dataType":"string"},
            "minionId": {"dataType":"string","required":true},
            "setStatus": {"ref":"SwitchOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IftttActionTriggered": {
        "dataType": "refObject",
        "properties": {
            "apiKey": {"dataType":"string","required":true},
            "localMac": {"dataType":"string"},
            "setStatus": {"ref":"SwitchOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IftttActionTriggeredRequest": {
        "dataType": "refObject",
        "properties": {
            "apiKey": {"dataType":"string","required":true},
            "localMac": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionTimeline": {
        "dataType": "refObject",
        "properties": {
            "minionId": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
            "status": {"ref":"MinionStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionRename": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinionSetRoomName": {
        "dataType": "refObject",
        "properties": {
            "room": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SetMinionAutoTurnOff": {
        "dataType": "refObject",
        "properties": {
            "setAutoTurnOffMS": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProgressStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["inProgress"]},{"dataType":"enum","enums":["finished"]},{"dataType":"enum","enums":["fail"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ScanningStatus": {
        "dataType": "refObject",
        "properties": {
            "scanningStatus": {"ref":"ProgressStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IftttOnChanged": {
        "dataType": "refObject",
        "properties": {
            "localMac": {"dataType":"string"},
            "deviceId": {"dataType":"string","required":true},
            "newStatus": {"ref":"SwitchOptions","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Operation": {
        "dataType": "refObject",
        "properties": {
            "operationId": {"dataType":"string","required":true},
            "operationName": {"dataType":"string","required":true},
            "activities": {"dataType":"array","array":{"dataType":"refObject","ref":"OperationActivity"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommandsRepoDevice": {
        "dataType": "refObject",
        "properties": {
            "brand": {"dataType":"string","required":true},
            "model": {"dataType":"string","required":true},
            "category": {"ref":"MinionTypes","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RemoteConnectionStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["notConfigured"]},{"dataType":"enum","enums":["cantReachRemoteServer"]},{"dataType":"enum","enums":["authorizationFail"]},{"dataType":"enum","enums":["localServerDisconnected"]},{"dataType":"enum","enums":["connectionOK"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RemoteSettings": {
        "dataType": "refObject",
        "properties": {
            "host": {"dataType":"string","required":true},
            "connectionKey": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthScopes": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["adminAuth"]},{"dataType":"enum","enums":["userAuth"]},{"dataType":"enum","enums":["iftttAuth"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refObject",
        "properties": {
            "displayName": {"dataType":"string"},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string"},
            "ignoreTfa": {"dataType":"boolean","required":true},
            "scope": {"ref":"AuthScopes","required":true},
            "passwordChangeRequired": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserForwardAuth": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string","required":true,"validators":{"minLength":{"value":6},"maxLength":{"value":6}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateResults": {
        "dataType": "refObject",
        "properties": {
            "alreadyUpToDate": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VersionUpdateStatus": {
        "dataType": "refObject",
        "properties": {
            "updateStatus": {"ref":"ProgressStatus","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VersionInfo": {
        "dataType": "refObject",
        "properties": {
            "version": {"dataType":"string","required":true},
            "commitHash": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.post('/API/auth/login',

            function AuthController_login(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    login: {"in":"body","name":"login","required":true,"ref":"Login"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new AuthController();


            const promise = controller.login.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/auth/login/tfa',

            function AuthController_loginTfa(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    login: {"in":"body","name":"login","required":true,"ref":"LoginMfa"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new AuthController();


            const promise = controller.loginTfa.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/auth/logout',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function AuthController_logout(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new AuthController();


            const promise = controller.logout.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/auth/logout-sessions/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function AuthController_logoutSessions(request: any, response: any, next: any) {
            const args = {
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new AuthController();


            const promise = controller.logoutSessions.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/backup',
            authenticateMiddleware([{"adminAuth":[]}]),

            function BackupController_getSettingsBackup(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new BackupController();


            const promise = controller.getSettingsBackup.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/devices',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function DevicesController_getDevices(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new DevicesController();


            const promise = controller.getDevices.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/devices/kinds',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function DevicesController_getDevicesKinds(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new DevicesController();


            const promise = controller.getDevicesKinds.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/devices/:deviceMac',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function DevicesController_setDeviceName(request: any, response: any, next: any) {
            const args = {
                    deviceMac: {"in":"path","name":"deviceMac","required":true,"dataType":"string"},
                    device: {"in":"body","name":"device","required":true,"ref":"LocalNetworkDevice"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new DevicesController();


            const promise = controller.setDeviceName.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/devices/rescan',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function DevicesController_rescanDevices(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new DevicesController();


            const promise = controller.rescanDevices.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/feed/minions',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function FeedController_getMinionsFeed(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new FeedController();


            const promise = controller.getMinionsFeed.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/feed/timings',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function FeedController_getTimingFeed(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new FeedController();


            const promise = controller.getTimingFeed.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/ifttt/settings',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function IftttController_isIftttEnabled(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new IftttController();


            const promise = controller.isIftttEnabled.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/ifttt/settings',
            authenticateMiddleware([{"adminAuth":[]}]),

            function IftttController_setIftttIntegrationSettings(request: any, response: any, next: any) {
            const args = {
                    iftttIntegrationSettings: {"in":"body","name":"iftttIntegrationSettings","required":true,"ref":"IftttIntegrationSettings"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new IftttController();


            const promise = controller.setIftttIntegrationSettings.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/ifttt/trigger/minions/raw',
            authenticateMiddleware([{"iftttAuth":[]}]),

            function IftttController_triggeredSomeAction(request: any, response: any, next: any) {
            const args = {
                    iftttRawActionTriggerd: {"in":"body","name":"iftttRawActionTriggerd","required":true,"ref":"IftttRawActionTriggered"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new IftttController();


            const promise = controller.triggeredSomeAction.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/ifttt/trigger/minions/:minionId',
            authenticateMiddleware([{"iftttAuth":[]}]),

            function IftttController_triggeredMinionAction(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    iftttActionTriggered: {"in":"body","name":"iftttActionTriggered","required":true,"ref":"IftttActionTriggered"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new IftttController();


            const promise = controller.triggeredMinionAction.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/ifttt/trigger/operations/:operationId',
            authenticateMiddleware([{"iftttAuth":[]}]),

            function IftttController_triggeredOperationAction(request: any, response: any, next: any) {
            const args = {
                    operationId: {"in":"path","name":"operationId","required":true,"dataType":"string"},
                    iftttActionTriggeredRequest: {"in":"body","name":"iftttActionTriggeredRequest","required":true,"ref":"IftttActionTriggeredRequest"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new IftttController();


            const promise = controller.triggeredOperationAction.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/logs',
            authenticateMiddleware([{"adminAuth":[]}]),

            function LogsController_getLastLogs(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new LogsController();


            const promise = controller.getLastLogs.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/minions/timeline',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_getMinionsTimeline(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.getMinionsTimeline.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/power-off',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_powerAllOff(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.powerAllOff.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/rename/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_renameMinion(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    minionRename: {"in":"body","name":"minionRename","required":true,"ref":"MinionRename"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.renameMinion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/room/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_renameRoom(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    roomName: {"in":"body","name":"roomName","required":true,"ref":"MinionSetRoomName"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.renameRoom.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/timeout/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_setMinionTimeout(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    setTimeout: {"in":"body","name":"setTimeout","required":true,"ref":"SetMinionAutoTurnOff"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.setMinionTimeout.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/calibrate/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_setMinionCalibrate(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    calibration: {"in":"body","name":"calibration","required":true,"ref":"MinionCalibrate"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.setMinionCalibrate.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/minions/rescan/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_rescanMinionStatus(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.rescanMinionStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/minions/rescan',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_rescanMinionsStatus(request: any, response: any, next: any) {
            const args = {
                    scanNetwork: {"default":false,"in":"query","name":"scanNetwork","dataType":"boolean"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.rescanMinionsStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/minions/rescan',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_getSescaningMinionsStatus(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.getSescaningMinionsStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/API/minions/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_deleteMinion(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.deleteMinion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/minions',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_createMinion(request: any, response: any, next: any) {
            const args = {
                    minion: {"in":"body","name":"minion","required":true,"ref":"Minion"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.createMinion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/:minionId/ifttt',
            authenticateMiddleware([{"iftttAuth":[]}]),

            function MinionsController_notifyMinionStatusChanged(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    iftttOnChanged: {"in":"body","name":"iftttOnChanged","required":true,"ref":"IftttOnChanged"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.notifyMinionStatusChanged.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/minions',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_getMinions(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.getMinions.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/minions/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_getMinion(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.getMinion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/minions/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function MinionsController_setMinion(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    setStatus: {"in":"body","name":"setStatus","required":true,"ref":"MinionStatus"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new MinionsController();


            const promise = controller.setMinion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/operations',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function OperationsController_getOperations(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new OperationsController();


            const promise = controller.getOperations.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/operations/:operationId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function OperationsController_getOperation(request: any, response: any, next: any) {
            const args = {
                    operationId: {"in":"path","name":"operationId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new OperationsController();


            const promise = controller.getOperation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/operations/:operationId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function OperationsController_setOperation(request: any, response: any, next: any) {
            const args = {
                    operationId: {"in":"path","name":"operationId","required":true,"dataType":"string"},
                    operation: {"in":"body","name":"operation","required":true,"ref":"Operation"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new OperationsController();


            const promise = controller.setOperation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/API/operations/:operationId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function OperationsController_deleteOperation(request: any, response: any, next: any) {
            const args = {
                    operationId: {"in":"path","name":"operationId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new OperationsController();


            const promise = controller.deleteOperation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/operations',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function OperationsController_createOperation(request: any, response: any, next: any) {
            const args = {
                    operation: {"in":"body","name":"operation","required":true,"ref":"Operation"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new OperationsController();


            const promise = controller.createOperation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/operations/trigger/:operationId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function OperationsController_triggerOperation(request: any, response: any, next: any) {
            const args = {
                    operationId: {"in":"path","name":"operationId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new OperationsController();


            const promise = controller.triggerOperation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/rf/devices',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function RfController_getCommandsRepoAvailableDevices(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RfController();


            const promise = controller.getCommandsRepoAvailableDevices.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/rf/fetch-commands/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function RfController_fetchDeviceCommandsToMinion(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    commandsRepoDevice: {"in":"body","name":"commandsRepoDevice","required":true,"ref":"CommandsRepoDevice"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RfController();


            const promise = controller.fetchDeviceCommandsToMinion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/rf/record/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function RfController_recordMinionCommand(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    minionStatus: {"in":"body","name":"minionStatus","required":true,"ref":"MinionStatus"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RfController();


            const promise = controller.recordMinionCommand.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/rf/generate/:minionId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function RfController_generateMinionCommand(request: any, response: any, next: any) {
            const args = {
                    minionId: {"in":"path","name":"minionId","required":true,"dataType":"string"},
                    minionStatus: {"in":"body","name":"minionStatus","required":true,"ref":"MinionStatus"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RfController();


            const promise = controller.generateMinionCommand.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/remote',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function RemoteConnectionController_getRemoteHost(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RemoteConnectionController();


            const promise = controller.getRemoteHost.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/remote/status',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function RemoteConnectionController_getConnectionStatus(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RemoteConnectionController();


            const promise = controller.getConnectionStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/remote/machine-mac',
            authenticateMiddleware([{"adminAuth":[]}]),

            function RemoteConnectionController_getMachineMac(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RemoteConnectionController();


            const promise = controller.getMachineMac.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/remote',
            authenticateMiddleware([{"adminAuth":[]}]),

            function RemoteConnectionController_setRemoteSettings(request: any, response: any, next: any) {
            const args = {
                    remoteSettings: {"in":"body","name":"remoteSettings","required":true,"ref":"RemoteSettings"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RemoteConnectionController();


            const promise = controller.setRemoteSettings.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/API/remote',
            authenticateMiddleware([{"adminAuth":[]}]),

            function RemoteConnectionController_removeRemoteSettings(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new RemoteConnectionController();


            const promise = controller.removeRemoteSettings.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/timings',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function TimingsController_getTimings(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new TimingsController();


            const promise = controller.getTimings.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/timings/:timingId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function TimingsController_getTiming(request: any, response: any, next: any) {
            const args = {
                    timingId: {"in":"path","name":"timingId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new TimingsController();


            const promise = controller.getTiming.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/timings/:timingId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function TimingsController_setTiming(request: any, response: any, next: any) {
            const args = {
                    timingId: {"in":"path","name":"timingId","required":true,"dataType":"string"},
                    timing: {"in":"body","name":"timing","required":true,"ref":"Timing"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new TimingsController();


            const promise = controller.setTiming.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/API/timings/:timingId',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function TimingsController_deleteTiming(request: any, response: any, next: any) {
            const args = {
                    timingId: {"in":"path","name":"timingId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new TimingsController();


            const promise = controller.deleteTiming.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/timings',
            authenticateMiddleware([{"userAuth":[]},{"adminAuth":[]}]),

            function TimingsController_createTiming(request: any, response: any, next: any) {
            const args = {
                    timing: {"in":"body","name":"timing","required":true,"ref":"Timing"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new TimingsController();


            const promise = controller.createTiming.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/users/profile',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_getProfile(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.getProfile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/users/forward-auth/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_requestUserForwarding(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.requestUserForwarding.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/users/forward',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_getRegisteredUsers(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.getRegisteredUsers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/users/forward/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_requestUserForwardingAuth(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                    auth: {"in":"body","name":"auth","required":true,"ref":"UserForwardAuth"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.requestUserForwardingAuth.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/API/users/forward/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_removeUserForwarding(request: any, response: any, next: any) {
            const args = {
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.removeUserForwarding.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/users',
            authenticateMiddleware([{"adminAuth":[]}]),

            function UsersController_getUsers(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.getUsers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/users/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_getUser(request: any, response: any, next: any) {
            const args = {
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.getUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/users/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_setUser(request: any, response: any, next: any) {
            const args = {
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
                    user: {"in":"body","name":"user","required":true,"ref":"User"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.setUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/API/users/:userId',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function UsersController_deleteUser(request: any, response: any, next: any) {
            const args = {
                    userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                    request: {"in":"request","name":"request","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.deleteUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/API/users',
            authenticateMiddleware([{"adminAuth":[]}]),

            function UsersController_createUser(request: any, response: any, next: any) {
            const args = {
                    user: {"in":"body","name":"user","required":true,"ref":"User"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new UsersController();


            const promise = controller.createUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.put('/API/version/latest',
            authenticateMiddleware([{"adminAuth":[]}]),

            function VersionsController_updateVersion(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new VersionsController();


            const promise = controller.updateVersion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/version/update-status',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function VersionsController_getUpdateStatus(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new VersionsController();


            const promise = controller.getUpdateStatus.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/version',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function VersionsController_getCurrentVersion(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new VersionsController();


            const promise = controller.getCurrentVersion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/API/version/is-up-date',
            authenticateMiddleware([{"adminAuth":[]},{"userAuth":[]}]),

            function VersionsController_isLatestVersion(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);
            } catch (err) {
                return next(err);
            }

            const controller = new VersionsController();


            const promise = controller.isLatestVersion.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, undefined, next);
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, _response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthentication(request, name, secMethod[name])
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await promiseAny(secMethodOrPromises);
                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
