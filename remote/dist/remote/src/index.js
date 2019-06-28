"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const WebSocket = require("ws");
const config_1 = require("../../backend/src/config");
const logger_1 = require("../../backend/src/utilities/logger");
const app_1 = require("./app");
const channelsRoute_1 = require("./routers/channelsRoute");
const typeorm_1 = require("typeorm");
logger_1.logger.info('casa-net remote server app starting...');
// Start HTTP application
let server = http.createServer(app_1.default).listen(config_1.Configuration.http.httpPort, () => {
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
        /** Prefer https. */
        server = https.createServer(sslOptions, app_1.default).listen(config_1.Configuration.http.httpsPort, () => {
            logger_1.logger.info('HTTPS/SSL listen on port ' + config_1.Configuration.http.httpsPort);
        });
    }
    catch (error) {
        logger_1.logger.fatal(`Faild to load SSL certificate ${error}, exit...`);
        process.exit();
    }
}
(async () => {
    try {
        await typeorm_1.createConnection();
        logger_1.logger.info('successfully connected to DB.');
        const wss = new WebSocket.Server({ server });
        const channelsRouter = new channelsRoute_1.ChannelsRouter();
        channelsRouter.IncomingWsChannels(wss);
        logger_1.logger.info('listening to WS channels...');
    }
    catch (error) {
        logger_1.logger.fatal('DB connection failed, exiting...', error);
        process.exit();
    }
})();
//# sourceMappingURL=index.js.map