"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
console.log('\x1b[34m', welcomeMessage, '\x1b[0m');
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./utilities/logger");
logger_1.logger.info('home-iot-server app starting...');
// Start HTTP application
http.createServer(app_1.default).listen(config_1.Configuration.http.httpPort, () => {
    logger_1.logger.info('HTTP listen on port ' + config_1.Configuration.http.httpPort);
});
// SSL/HTTPS
if (config_1.Configuration.http.useHttps) {
    try {
        const key = fs.readFileSync(path.join(__dirname, '/../encryption/private.key'));
        const cert = fs.readFileSync(path.join(__dirname, '/../encryption/certificate.crt'));
        const ca = fs.readFileSync(path.join(__dirname, '/../encryption/ca_bundle.crt'));
        const sslOptions = {
            key,
            cert,
            ca,
        };
        https.createServer(sslOptions, app_1.default).listen(config_1.Configuration.http.httpsPort, () => {
            logger_1.logger.info('HTTPS/SSL listen on port ' + config_1.Configuration.http.httpsPort);
        });
    }
    catch (error) {
        logger_1.logger.fatal(`Faild to load SSL certificate ${error}, exit...`);
        process.exit();
    }
}
//# sourceMappingURL=index.js.map