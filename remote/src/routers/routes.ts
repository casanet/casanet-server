// @ts-ignore
/* tslint:disable */
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { AuthController } from './../../../backend/src/controllers/authController';
import { FeedController } from './../controllers/feedController';
import { ForwardAuthController } from './../controllers/forwardAuthController';
import { ForwardingController } from './../controllers/forwardingController';
import { ChannelsController } from './../controllers/channelsController';
import { AdministrationUsersController } from './../controllers/administrationUsersController';
import { LocalServersController } from './../controllers/localServersController';
import { AdministrationAuthController } from './../controllers/administrationAuthController';
import { StaticsAssetsController } from './../controllers/staticAssetsController';
import { ManagementsAssetsController } from './../controllers/managementAssetsController';
import { expressAuthentication } from './../security/authenticationExtend';
import * as express from 'express';
import { ErrorResponse, User } from '../../../backend/src/models/sharedInterfaces';
const models: TsoaRoute.Models = {
    "ErrorResponse": {
        "properties": {
            "responseCode": { "dataType": "double", "required": true },
            "message": { "dataType": "string" },
        },
    },
    "Login": {
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
    },
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
    "AirConditioning": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "temperature": { "dataType": "enum", "enums": ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"], "required": true },
            "mode": { "dataType": "enum", "enums": ["hot", "cold", "dry", "auto"], "required": true },
            "fanStrength": { "dataType": "enum", "enums": ["low", "med", "high", "auto"], "required": true },
        },
    },
    "Light": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "brightness": { "dataType": "enum", "enums": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100"], "required": true },
        },
    },
    "TemperatureLight": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "brightness": { "dataType": "enum", "enums": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100"], "required": true },
            "temperature": { "dataType": "enum", "enums": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100"], "required": true },
        },
    },
    "ColorLight": {
        "properties": {
            "status": { "dataType": "enum", "enums": ["on", "off"], "required": true },
            "brightness": { "dataType": "enum", "enums": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100"], "required": true },
            "temperature": { "dataType": "enum", "enums": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100"], "required": true },
            "red": { "dataType": "enum", "enums": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255"], "required": true },
            "green": { "dataType": "enum", "enums": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255"], "required": true },
            "blue": { "dataType": "enum", "enums": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254", "255"], "required": true },
        },
    },
    "MinionStatus": {
        "properties": {
            "toggle": { "ref": "Toggle" },
            "switch": { "ref": "Switch" },
            "roller": { "ref": "Roller" },
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
            "minionType": { "dataType": "enum", "enums": ["toggle", "switch", "roller", "airConditioning", "light", "temperatureLight", "colorLight"], "required": true },
            "minionAutoTurnOffMS": { "dataType": "double" },
        },
    },
    "MinionFeed": {
        "properties": {
            "event": { "dataType": "enum", "enums": ["created", "update", "removed"], "required": true },
            "minion": { "ref": "Minion", "required": true },
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
            "hour": { "dataType": "enum", "enums": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"], "required": true },
            "minutes": { "dataType": "enum", "enums": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"], "required": true },
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
    "User": {
        "properties": {
            "displayName": { "dataType": "string" },
            "email": { "dataType": "string", "required": true },
            "sessionTimeOutMS": { "dataType": "double", "required": true },
            "password": { "dataType": "string", "required": true },
            "ignoreTfa": { "dataType": "boolean", "required": true },
            "scope": { "dataType": "enum", "enums": ["adminAuth", "userAuth", "iftttAuth"], "required": true },
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
};
const validationService = new ValidationService(models);

export function RegisterRoutes(app: express.Express) {
    app.post('/API/auth/login',
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                login: { "in": "body", "name": "login", "required": true, "ref": "Login" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AuthController();


            const promise = controller.loginDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/auth/login/tfa',
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                login: { "in": "body", "name": "login", "required": true, "ref": "Login" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AuthController();


            const promise = controller.loginTfaDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/auth/logout',
        authenticateMiddleware([{ "userAuth": [] }, { "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AuthController();


            const promise = controller.logoutDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/feed/minions',
        authenticateMiddleware([{ "userAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new FeedController();


            const promise = controller.getMinionsFeed.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/feed/timings',
        authenticateMiddleware([{ "userAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new FeedController();


            const promise = controller.getTimingFeed.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/auth/login',
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                login: { "in": "body", "name": "login", "required": true, "ref": "LoginLocalServer" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ForwardAuthController();


            const promise = controller.loginDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/auth/login/tfa',
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                login: { "in": "body", "name": "login", "required": true, "ref": "LoginLocalServer" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ForwardAuthController();


            const promise = controller.loginTfaDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/auth/logout',
        authenticateMiddleware([{ "userAuth": [] }, { "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ForwardAuthController();


            const promise = controller.logoutDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/API/ifttt/trigger/**/*',
        authenticateMiddleware([{ "iftttAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ForwardingController();


            const promise = controller.apiForwardingIftttDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/API/**/*',
        authenticateMiddleware([{ "userAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ForwardingController();


            const promise = controller.apiForwardingDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/channels',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ChannelsController();


            const promise = controller.connectToRemoteViaWsDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/administration/users/profile',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationUsersController();


            const promise = controller.getProfile.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/administration/users',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationUsersController();


            const promise = controller.getUsers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/administration/users/:adminId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                adminId: { "in": "path", "name": "adminId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationUsersController();


            const promise = controller.getUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/API/administration/users/:adminId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                adminId: { "in": "path", "name": "adminId", "required": true, "dataType": "string" },
                user: { "in": "body", "name": "user", "required": true, "ref": "User" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationUsersController();


            const promise = controller.setUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/API/administration/users/:adminId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                adminId: { "in": "path", "name": "adminId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationUsersController();


            const promise = controller.deleteUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/administration/users',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                user: { "in": "body", "name": "user", "required": true, "ref": "User" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationUsersController();


            const promise = controller.createUser.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/servers',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.getLocalServers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/servers/:localServerId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.getLocalServer.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/servers',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                localServer: { "in": "body", "name": "localServer", "required": true, "ref": "LocalServer" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.addLocalServer.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.put('/API/servers/:localServerId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
                localServer: { "in": "body", "name": "localServer", "required": true, "ref": "LocalServer" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.updateLocalServer.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.delete('/API/servers/:localServerId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.deleteLocalServer.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/servers/auth/:localServerId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.generateAuthKeyLocalServer.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/servers/local-users/:localServerId',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
                localServerId: { "in": "path", "name": "localServerId", "required": true, "dataType": "string" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new LocalServersController();


            const promise = controller.getLocalServerUsers.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/administration/auth/login',
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                login: { "in": "body", "name": "login", "required": true, "ref": "Login" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationAuthController();


            const promise = controller.administrationLoginDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/administration/auth/login/tfa',
        function(request: any, response: any, next: any) {
            const args = {
                request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
                login: { "in": "body", "name": "login", "required": true, "ref": "Login" },
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationAuthController();


            const promise = controller.administrationLoginTfaDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.post('/API/administration/auth/logout',
        authenticateMiddleware([{ "adminAuth": [] }]),
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new AdministrationAuthController();


            const promise = controller.administrationLogoutDocumentation.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/static/**/*',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new StaticsAssetsController();


            const promise = controller.getStaticsAssets.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });
    app.get('/API/management/**/*',
        function(request: any, response: any, next: any) {
            const args = {
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                response.status(422).send({
                    responseCode: 1422,
                } as ErrorResponse);
                return;
            }

            const controller = new ManagementsAssetsController();


            const promise = controller.getManagementsAssets.apply(controller, validatedArgs as any);
            promiseHandler(controller, promise, response, next);
        });

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return (request: any, _response: any, next: any) => {

            const succeed = function(user: any) {
                request['user'] = user;
                next();
            }

            const fail = async function(error: any) {
                _response.status(401).send({
                    responseCode: 1401,
                } as ErrorResponse);
            }

            const scopes: string[] = [];
            try {
                for (const scop of security) {
                    scopes.push(Object.keys(scop)[0]);
                }
            } catch (error) {
            }

            expressAuthentication(request, scopes)
                .then(succeed)
                .catch(fail)
        }
    }

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode;
                if (isController(controllerObj)) {
                    const headers = controllerObj.getHeaders();
                    Object.keys(headers).forEach((name: string) => {
                        response.set(name, headers[name]);
                    });

                    statusCode = controllerObj.getStatus();
                }

                if (data || data === false) { // === false allows boolean result
                    response.status(statusCode || 200).json(data);
                } else {
                    response.status(statusCode || 204).end();
                }
            })
            .catch(async (error: any) => {
                /**
                 * If error is from TSOA sent it back to client (it's part of API)
                 * Else throw it back.
                 */
                try {
                    const cleanError = {
                        responseCode: error.responseCode,
                        message: error.message
                    } as ErrorResponse;

                    if (typeof cleanError.responseCode !== 'number') {
                        throw new Error('invalid error schema');
                    }
                    response.status(500).send(cleanError);
                } catch (error) {
                    response.status(500).send({
                        responseCode: 1500,
                        message: 'unknown error',
                    } as ErrorResponse);
                }
            });
    }

    function getValidatedArgs(args: any, request: any): any[] {
        const fieldErrors: FieldErrors = {};
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
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }
}
