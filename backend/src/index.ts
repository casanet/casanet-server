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

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import app from './app';
import { Configuration } from './config';
import { logger } from './utilities/logger';

logger.info('home-iot-server app starting...');

// Start HTTP application
http.createServer(app).listen(Configuration.http.httpPort, () => {
  logger.info('HTTP listen on port ' + Configuration.http.httpPort);
});

// SSL/HTTPS
if (Configuration.http.useHttps) {
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
      logger.info('HTTPS/SSL listen on port ' + Configuration.http.httpsPort);
    });
  } catch (error) {
    logger.error(`Faild to load SSL certificate ${error}, exit...`);
    process.exit();
  }
}

// Catch uncaughtException instead of crashing
process.on('uncaughtException', (err: any) => {
  logger.error(`[home-iot-server] app uncaughtException, error: ${JSON.stringify(err)}`);
});
process.on('exit', (code) => {
  logger.warn(`[home-iot-server] About to exit with code: ${code}`);
});
process.on('SIGINT', () => {
  logger.warn(`[home-iot-server] About to exit SIGINT`);
});
process.on('SIGTERM', () => {
  logger.warn(`[home-iot-server] About to exit SIGTERM`);
});
process.on('SIGTERM', () => {
  logger.warn(`[home-iot-server] About to exit SIGTERM`);
});
