import * as log4js from 'log4js';
import * as path from 'path';

const LOG_FILE_NAME: string = path.join('logs', 'tech_log.log');

log4js.configure({
  appenders: {
    file_log: {
      type: 'file',
      filename: LOG_FILE_NAME,
      maxLogSize: 10 * 1000000, // 10 mb
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

export const logger: log4js.Logger = log4js.getLogger();
