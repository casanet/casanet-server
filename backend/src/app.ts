import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as forceSsl from 'express-force-ssl';
import * as rateLimit from 'express-rate-limit';
import { sanitizeExpressMiddleware } from 'generic-json-sanitizer';
import * as helmet from 'helmet';
import * as path from 'path';
import { RemoteConnectionBlSingleton } from './business-layer/remoteConnectionBl';
import { Configuration } from './config';
import { AuthenticationRouter } from './routers/authenticationRoute';
import { FeedRouter } from './routers/feedRoute';
import { RegisterRoutes } from './routers/routes';
import { logger } from './utilities/logger';

// controllers need to be referenced in order to get crawled by the TSOA generator
import './controllers/authController';
import './controllers/devicesController';
import './controllers/feedController';
import './controllers/iftttController';
import './controllers/minionsController';
import './controllers/operationsController';
import './controllers/radioFrequencyController';
import './controllers/remoteConnectionController';
import './controllers/staticAssetsController';
import './controllers/timingsController';
import './controllers/usersController';
import './controllers/versionsController';

// also import other moduls that not imported in other place.
import './business-layer/timeoutBl';

class App {
    public express: express.Express;
    private authenticationRouter: AuthenticationRouter = new AuthenticationRouter();
    private feedRouter: FeedRouter = new FeedRouter();

    constructor() {
        /** Creat the express app */
        this.express = express();

        /** Security is the first thing, right?  */
        this.vulnerabilityProtection();

        /** Parse the request */
        this.dataParsing();

        /** After data parsed, sanitize it. */
        this.sanitizeData();

        /** Serve static client side assets */
        this.serveStatic();

        /** Load instance to remote server connection logic. */
        this.loadRemoteServerConnection();

        /** Finaly route to API */
        this.routes();

        /** And never sent errors back to the client. */
        this.catchErrors();
    }

    /**
     * Serve static files of front-end.
     */
    private serveStatic() {
        /** In / path only serve the index.html file */
        this.express.get('/', (req: express.Request, res: express.Response) =>
            res.sendFile(path.join(__dirname, '/public/index.html')));
        /** Get any file in public directory */
        this.express.use('/static', express.static(path.join(__dirname, '/public/')));
    }

    /**
     * Route requests to API.
     */
    private routes(): void {

        /** Route authentication API */
        this.authenticationRouter.routes(this.express);

        /** Route system feed */
        this.feedRouter.routes(this.express);

        /** Use generated routers (by TSOA) */
        RegisterRoutes(this.express);
    }

    /**
     * Protect from many vulnerabilities ,by http headers such as HSTS HTTPS redirect etc.
     */
    private vulnerabilityProtection(): void {

        // Protect from DDOS and access thieves
        const limiter = rateLimit({
            windowMs: Configuration.requestsLimit.windowsMs,
            max: Configuration.requestsLimit.maxRequests,
        });
        // apply to all requests
        this.express.use(limiter);

        // Protect authentication API from guessing username/password.
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10,
        });
        // apply to all authentication requests
        this.express.use('/API/auth/**', authLimiter);

        // Use to redirect http to https/ssl
        if (Configuration.http.useHttps) {
            this.express.use(forceSsl);
        }

        // Protect from XSS and other malicious attacks
        this.express.use(helmet());
        this.express.use(helmet.frameguard({ action: 'deny' }));
    }

    /**
     * Init remote server, with app router.
     */
    private loadRemoteServerConnection() {
        RemoteConnectionBlSingleton.loadExpressRouter(this.express);
    }

    /**
     * Parse request query and body.
     */
    private dataParsing(): void {
        this.express.use(cookieParser()); // Parse every request cookie to readble json.

        this.express.use(bodyParser.json({ limit: '2mb' })); // for parsing application/json
    }

    /**
     * Sanitize Json schema arrived from client.
     * to avoid stored XSS issues.
     */
    private sanitizeData(): void {
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            sanitizeExpressMiddleware(req, res, next, {
                allowedAttributes: {},
                allowedTags: [],
            });
        });
    }

    /**
     * Catch any Node / JS error.
     */
    private catchErrors() {

        // Unknowon routing get 404
        this.express.use('*', (req, res) => {
            res.statusCode = 404;
            res.send();
        });

        /**
         * Production error handler, no stacktraces leaked to the client.
         */
        this.express.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                logger.warn(`express route crash,  req: ${req.method} ${req.path} error: ${err.message} body: ${JSON.stringify(req.body)}`);
            } catch (error) {
                logger.warn(`Ok... even the crash route catcher crashd...`);
            }
            res.status(500).send();
        });
    }
}

export default new App().express;
