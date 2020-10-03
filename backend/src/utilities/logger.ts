import * as path from 'path';
import * as winston from 'winston';

export const LOGS_DIR =  './logs';
export const LOG_FILE_PATH: string = path.join(LOGS_DIR, 'casalogs.log');

const logFormat = winston.format.printf(info => `[${new Date().toLocaleString()}] [${info.level}] ${info.message}`);

const casanetLogger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({
      format: logFormat,
      filename: LOG_FILE_PATH,
      maxsize: 1e6,
      maxFiles: 30,
      tailable: true,
      eol: `\r\n \n`, // For windows & linux new-lines flags
    }),
  ],
});

export const logger = casanetLogger;
