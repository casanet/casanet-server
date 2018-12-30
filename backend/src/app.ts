import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as forceSsl from 'express-force-ssl';
import * as RateLimit from 'express-rate-limit';
import * as useragent from 'express-useragent';
import * as helmet from 'helmet';
import * as path from 'path';
import { Configuration } from './app.config';
import { RegisterRoutes } from './routers/routes';
import { SecurityGate } from './security/accessGate';
import { logger } from './utilities/logger';

// controllers need to be referenced in order to get crawled by the TSOA generator
import './controllers/devicesController';
import './controllers/minionsController';
import './controllers/operationsController';
import './controllers/timingsController';
import './controllers/usersController';

class App {
    public express: express.Express;
    private securityGate: SecurityGate = new SecurityGate();

    constructor() {
        /** Creat the express app */
        this.express = express();

        /** Security is the first thing, right?  */
        this.vulnerabilityProtection();

        /** Parse the request */
        this.dataParsing();

        /** Before any work with user request check his certificates */
        this.accessGate();

        /** Serve static client side */
        this.serveStatic();

        /** Finaly route to API */
        this.routes();

        /** And never sent errors back to client. */
        this.catchErrors();
    }

    /**
     * Check access certificates of request, and abort request if not pass.
     */
    private accessGate() {
        this.securityGate.checkAccess(this.express);
    }

    /**
     * Serve static files of front-end.
     */
    private serveStatic() {
        /** In / path only serve the index.html file */
        this.express.get('/', (req: express.Request, res: express.Response) =>
            res.sendFile(path.join(__dirname, '/public/index.html')));
        /** Get any file in public directory */
        this.express.use('/v1', express.static(path.join(__dirname, '/public/')));
    }

    /**
     * Route requests to API.
     */
    private routes(): void {
        /** Use generated routers (by TSOA) */
        RegisterRoutes(this.express);
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
     * Catch any Node / JS error.
     */
    private catchErrors() {

        // Unknowon routing get 404
        this.express.use('*', (req, res) => {
            res.statusCode = 404;
            res.send();
        });

        // Production error handler
        // no stacktraces leaked to user
        this.express.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                logger.warn('express route crash,  req:' + req.method + ' ' + req.path + ' body: ' + JSON.stringify(req.body));
            } catch (error) { }
            res.status(500).send();
        });
    }
}

export default new App().express;
