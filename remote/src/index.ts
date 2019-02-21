import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as WebSocket from 'ws';
import { Configuration } from '../../backend/src/config';
import { logger } from '../../backend/src/utilities/logger';
import app from './app';
import { ChannelsRouter } from './routers/channelsRoute';

logger.info('casa-net remote server app starting...');

// Start HTTP application // TODO: dont allw http only!
let server: any = http.createServer(app).listen(Configuration.http.httpPort, () => {
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

        /** Prefer https. */
        server = https.createServer(sslOptions, app).listen(Configuration.http.httpsPort, () => {
            logger.info('HTTPS/SSL listen on port ' + Configuration.http.httpsPort);
        });
    } catch (error) {
        logger.fatal(`Faild to load SSL certificate ${error}, exit...`);
        process.exit();
    }
}

const wss = new WebSocket.Server({ server });
const channelsRouter = new ChannelsRouter();
channelsRouter.IncomingWsChannels(wss);
