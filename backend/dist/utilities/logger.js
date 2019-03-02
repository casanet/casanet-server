"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const path = require("path");
const LOG_FILE_NAME = path.join('logs', 'tech_log.log');
log4js.configure({
    appenders: {
        file_log: {
            type: 'file',
            filename: LOG_FILE_NAME,
            maxLogSize: 10 * 1000000,
            backups: 50,
        },
        console_log: {
            type: 'console',
        },
    },
    categories: {
        default: {
            appenders: ['file_log', 'console_log'],
            level: process.env.NODE_ENV !== 'test' ? 'debug' : 'warn',
        },
    },
});
exports.logger = log4js.getLogger();
//# sourceMappingURL=logger.js.map