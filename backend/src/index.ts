const welcomeMessage = `
    .::         .:         .:: ::        .:       .:::     .::.::::::::.::: .::::::
 .::   .::     .: ::     .::    .::     .: ::     .: .::   .::.::           .::    
.::           .:  .::     .::          .:  .::    .:: .::  .::.::           .::    
.::          .::   .::      .::       .::   .::   .::  .:: .::.::::::       .::    
.::         .:::::: .::        .::   .:::::: .::  .::   .: .::.::           .::    
 .::   .:: .::       .:: .::    .:: .::       .:: .::    .: ::.::           .::    
   .::::  .::         .::  .:: ::  .::         .::.::      .::.::::::::     .::    


  '||'                              '||   .|'''.|                                           
   ||         ...     ....   ....    ||   ||..  '    ....  ... ..  .... ...   ....  ... ..  
   ||       .|  '|. .|   '' '' .||   ||    ''|||.  .|...||  ||' ''  '|.  |  .|...||  ||' '' 
   ||       ||   || ||      .|' ||   ||  .     '|| ||       ||       '|.|   ||       ||     
  .||.....|  '|..|'  '|...' '|..'|' .||. |'....|'   '|...' .||.       '|     '|...' .||.    
                                                                                            
`;

// tslint:disable-next-line: no-console
console.info('\x1b[34m', welcomeMessage, '\x1b[0m');

import { exec } from 'child-process-promise';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { Configuration } from './config';
import { logger } from './utilities/logger';
import { app } from './app';
import { MinionsBlSingleton } from './business-layer/minionsBl';
import { TimeoutBlSingleton } from './business-layer/timeoutBl';
import { CalibrateBlSingleton } from './business-layer/calibrateBl';
import { RemoteConnectionBlSingleton } from './business-layer/remoteConnectionBl';
import { TimingsBlSingleton } from './business-layer/timingsBl';
import { TimelineBlSingleton } from './business-layer/timelineBl';

logger.info('home-iot-server app starting...');

async function initServices() {
  try {

    logger.info(`[home-iot-server] ------------------- ------------------- Initializing minions module... -------------------`);
    await MinionsBlSingleton.initMinionsModule();
    logger.info(`[home-iot-server] ------------------- Initializing minions module succeed -------------------`);

    logger.info(`[home-iot-server] ------------------- Initializing timeline module... -------------------`);
    await TimelineBlSingleton.initTimelineModule();
    logger.info(`[home-iot-server] ------------------- Initializing timeline module succeed -------------------`);

    logger.info(`[home-iot-server] ------------------- Initializing remote connection module... -------------------`);
    await RemoteConnectionBlSingleton.initRemoteConnectionModule();
    logger.info(`[home-iot-server] ------------------- Initializing remote connection module succeed -------------------`);

    logger.info(`[home-iot-server] ------------------- Initializing timings module... -------------------`);
    await TimingsBlSingleton.initTimingModule();
    logger.info(`[home-iot-server] ------------------- Initializing timings module succeed -------------------`);

    logger.info(`[home-iot-server] ------------------- Initializing timeout module... -------------------`);
    await TimeoutBlSingleton.initTimeoutModule();
    logger.info(`[home-iot-server] ------------------- Initializing timeout module succeed -------------------`);

    logger.info(`[home-iot-server] ------------------- Initializing calibration module... -------------------`);
    await CalibrateBlSingleton.initCalibrateModule();
    logger.info(`[home-iot-server] ------------------- Initializing calibration module succeed -------------------`);

    // Start HTTP application
    logger.info(`[home-iot-server] ------------------- Initializing HTTP server... -------------------`);
    http.createServer(app).listen(Configuration.http.httpPort, () => {
      logger.info(`[home-iot-server] ------------------- Initializing HTTP server on port ${Configuration.http.httpPort} succeed -------------------`);
    });

    // SSL/HTTPS
    if (Configuration.http.useHttps) {
      logger.info(`[home-iot-server] ------------------- Initializing HTTPS server... -------------------`);
      try {
        const key = fs.readFileSync('./encryption/private.key');
        const cert = fs.readFileSync('./encryption/certificate.crt');
        const ca = fs.readFileSync('./encryption/ca_bundle.crt');

        const sslOptions: https.ServerOptions = {
          key,
          cert,
          ca,
        };

        https.createServer(sslOptions, app).listen(Configuration.http.httpsPort, () => {
          logger.info(`[home-iot-server] ------------------- Initializing HTTPS server on port ${Configuration.http.httpPort} succeed -------------------`);
        });
      } catch (error) {
        logger.error(`Failed to load SSL certificate ${error}, exit...`);
        process.exit();
      }
    }
  } catch (error) {
    logger.error(`[home-iot-server] app services initialization failed, error: ${error} ${error?.message} ${JSON.stringify(error)}\nstack: ${error.stack}`);
  }
}

// Catch uncaughtException instead of crashing
process.on('uncaughtException', async (err: any) => {
  const error = new Error();
  logger.error(`[home-iot-server] app uncaughtException, error: ${err} ${err?.message} ${JSON.stringify(err)}\nstack: ${err?.stack}`);

  // start restart process....
  /** THIS IS A DANGERS ACTION! BE SURE THAT USER KNOW WHAT IT IS SET AS RESET COMMAND */
  const RESET_APP_ON_FAILURE = process.env.RESET_APP_ON_FAILURE;
  if (!RESET_APP_ON_FAILURE) {
    logger.info(`There is no "RESET_APP_ON_FAILURE" env var, skipping on failure reset app command`);
    return;
  }

  try {
    logger.info(`executing RESET_APP_ON_FAILURE='${RESET_APP_ON_FAILURE}' command...`);
    /**
     * Execute a command to apply the version changes
     * For example in raspberry pi machine the command can be 'sudo reboot'.
     */
    await exec(RESET_APP_ON_FAILURE);
  } catch (error) {
    logger.error(
      `executing RESET_APP_ON_FAILURE=${RESET_APP_ON_FAILURE}' command failed ${error.stdout ||
      error.message}`,
    );
  }
});
process.on('exit', (code) => {
  logger.warn(`[home-iot-server] About to exit with code: ${code}`);
});
process.on('SIGINT', () => {
  logger.warn(`[home-iot-server] About to exit SIGINT`);
  process.exit(1);
});
process.on('SIGTERM', () => {
  logger.warn(`[home-iot-server] About to exit SIGTERM`);
});
process.on('SIGTERM', () => {
  logger.warn(`[home-iot-server] About to exit SIGTERM`);
});

// Start services initialization
initServices();
