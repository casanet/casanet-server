const welcomeMessage = 
`
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

console.log('\x1b[34m', welcomeMessage ,'\x1b[0m');

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
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
        const key = fs.readFileSync(path.join(__dirname, '/../encryption/private.key'));
        const cert = fs.readFileSync(path.join(__dirname, '/../encryption/certificate.crt'));
        const ca = fs.readFileSync(path.join(__dirname, '/../encryption/ca_bundle.crt'));

        const sslOptions: https.ServerOptions = {
            key,
            cert,
            ca,
        };

        https.createServer(sslOptions, app).listen(Configuration.http.httpsPort, () => {
            logger.info('HTTPS/SSL listen on port ' + Configuration.http.httpsPort);
        });
    } catch (error) {
        logger.fatal(`Faild to load SSL certificate ${error}, exit...`);
        process.exit();
    }
}
