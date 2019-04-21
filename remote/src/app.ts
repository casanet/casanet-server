import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as forceSsl from 'express-force-ssl';
import * as RateLimit from 'express-rate-limit';
import * as useragent from 'express-useragent';
import { sanitizeExpressMiddleware } from 'generic-json-sanitizer';
import * as helmet from 'helmet';
import * as path from 'path';
import { Configuration } from '../../backend/src/config';
import { logger } from '../../backend/src/utilities/logger';
import { AdministrationAuthRouter } from './routers/administrationAuthRoute';
import { FeedRouter } from './routers/feedRoute';
import { ForwardAuthRouter } from './routers/forwardAuthRoute';
import { ForwardingRouter } from './routers/forwardingsRoute';
import { ForwardingIftttRouter } from './routers/forwardingsIftttRoute';
import { RegisterRoutes } from './routers/routes';

// controllers need to be referenced in order to get crawled by the TSOA generator
import './controllers/administrationAuthController';
import './controllers/administrationUsersController';
import './controllers/feedController';
import './controllers/forwardAuthController';
import './controllers/localServersController';
import './controllers/managementAssetsController';
import './controllers/staticAssetsController';

class App {
    public express: express.Express;
    private forwardAuthRouter: ForwardAuthRouter = new ForwardAuthRouter();
    private administrationAuthRouter: AdministrationAuthRouter = new AdministrationAuthRouter();
    private feedRouter: FeedRouter = new FeedRouter();
    private forwardingRouter: ForwardingRouter = new ForwardingRouter();
    private forwardingIftttRouter: ForwardingIftttRouter = new ForwardingIftttRouter();

    constructor() {
        /** Creat the express app */
        this.express = express();

        /** Security is the first thing, right?  */
        this.vulnerabilityProtection();

        /** Parse the request */
        this.dataParsing();

        /** After data parsed, sanitize it. */
        this.sanitizeData();

        /** Serve static client side */
        this.serveStatic();

        /** Serve managenebt static client side */
        this.serveManagementStatic();

        /** Route inner system */
        this.routes();
        
        /** Finaly route API of casa and forward it as is to local server */
        this.forwardingToLocal();

        /** And never sent errors back to client. */
        this.catchErrors();
    }

    /**
     * Serve static files of front-end.
     */
    private serveStatic() {
        /** In / path only serve the index.html file */
        this.express.get('/', (req: express.Request, res: express.Response) =>
            res.sendFile(path.join(__dirname, '/public/static/index.html')));
        /** Get any file in public directory */
        this.express.use('/static', express.static(path.join(__dirname, '/public/static/')));
    }

    /**
     * Serve management static files of.
     */
    private serveManagementStatic() {
        /** In /management path only serve the management index.html file */
        this.express.get('/management', (req: express.Request, res: express.Response) =>
            res.sendFile(path.join(__dirname, '/public/management/index.html')));
        /** Get any file in management public directory */
        this.express.use('/management', express.static(path.join(__dirname, '/public/management/')));
    }

    /**
     * Route requests to API.
     */
    private routes(): void {

        /** Route authentication API */
        this.forwardAuthRouter.routes(this.express);

        /** Route management auth API */
        this.administrationAuthRouter.routes(this.express);

        /** Route local systems system feed */
        this.feedRouter.routes(this.express);

        /** Use generated routers (by TSOA) */
        RegisterRoutes(this.express);
    }

    /**
     * Forward each casa API request to user local server AS IS.
     */
    private forwardingToLocal(): void {
        this.forwardingIftttRouter.forwardRouter(this.express);
        this.forwardingRouter.forwardRouter(this.express);
    }

    /**
     * Protect from many vulnerabilities ,by http headers such as HSTS HTTPS redirect etc.
     */
    private vulnerabilityProtection(): void {

        if (Configuration.http.useHttps) {
            this.express.use(forceSsl);
        } // Use to redirect http to https/ssl

        // Protect from DDOS and access thieves
        const limiter = new RateLimit({
            windowMs: Configuration.requestsLimit.windowsMs,
            max: Configuration.requestsLimit.maxRequests,
        });

        //  apply to all  IP requests
        this.express.use(limiter);

        // Protect from XSS and other malicious attacks
        this.express.use(helmet());
        this.express.use(helmet.frameguard({ action: 'deny' }));
    }

    /**
     * Parse request query and body.
     */
    private dataParsing(): void {
        this.express.use(cookieParser()); // Parse every request cookie to readble json.

        this.express.use(bodyParser.json({ limit: '2mb' })); // for parsing application/json
        this.express.use(useragent.express()); // for parsing user agent to readble struct
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
         * Production error handler, no stacktraces leaked to user.
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
