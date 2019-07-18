"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const forceSsl = require("express-force-ssl");
const rateLimit = require("express-rate-limit");
const generic_json_sanitizer_1 = require("generic-json-sanitizer");
const helmet = require("helmet");
const path = require("path");
const remoteConnectionBl_1 = require("./business-layer/remoteConnectionBl");
const config_1 = require("./config");
const authenticationRoute_1 = require("./routers/authenticationRoute");
const feedRoute_1 = require("./routers/feedRoute");
const routes_1 = require("./routers/routes");
const logger_1 = require("./utilities/logger");
// controllers need to be referenced in order to get crawled by the TSOA generator
require("./controllers/authController");
require("./controllers/devicesController");
require("./controllers/feedController");
require("./controllers/iftttController");
require("./controllers/minionsController");
require("./controllers/operationsController");
require("./controllers/remoteConnectionController");
require("./controllers/staticAssetsController");
require("./controllers/timingsController");
require("./controllers/usersController");
require("./controllers/versionsController");
// also import other moduls that not imported in other place.
require("./business-layer/timeoutBl");
class App {
    constructor() {
        this.authenticationRouter = new authenticationRoute_1.AuthenticationRouter();
        this.feedRouter = new feedRoute_1.FeedRouter();
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
    serveStatic() {
        /** In / path only serve the index.html file */
        this.express.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
        /** Get any file in public directory */
        this.express.use('/static', express.static(path.join(__dirname, '/public/')));
    }
    /**
     * Route requests to API.
     */
    routes() {
        /** Route authentication API */
        this.authenticationRouter.routes(this.express);
        /** Route system feed */
        this.feedRouter.routes(this.express);
        /** Use generated routers (by TSOA) */
        routes_1.RegisterRoutes(this.express);
    }
    /**
     * Protect from many vulnerabilities ,by http headers such as HSTS HTTPS redirect etc.
     */
    vulnerabilityProtection() {
        // Protect from DDOS and access thieves
        const limiter = rateLimit({
            windowMs: config_1.Configuration.requestsLimit.windowsMs,
            max: config_1.Configuration.requestsLimit.maxRequests,
        });
        // apply to all requests
        this.express.use(limiter);
        // Protect authentication API from guessing username/password.
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 10,
        });
        // apply to all authentication requests
        this.express.use('/API/auth/**', authLimiter);
        // Use to redirect http to https/ssl
        if (config_1.Configuration.http.useHttps) {
            this.express.use(forceSsl);
        }
        // Protect from XSS and other malicious attacks
        this.express.use(helmet());
        this.express.use(helmet.frameguard({ action: 'deny' }));
    }
    /**
     * Init remote server, with app router.
     */
    loadRemoteServerConnection() {
        remoteConnectionBl_1.RemoteConnectionBlSingleton.loadExpressRouter(this.express);
    }
    /**
     * Parse request query and body.
     */
    dataParsing() {
        this.express.use(cookieParser()); // Parse every request cookie to readble json.
        this.express.use(bodyParser.json({ limit: '2mb' })); // for parsing application/json
    }
    /**
     * Sanitize Json schema arrived from client.
     * to avoid stored XSS issues.
     */
    sanitizeData() {
        this.express.use((req, res, next) => {
            generic_json_sanitizer_1.sanitizeExpressMiddleware(req, res, next, {
                allowedAttributes: {},
                allowedTags: [],
            });
        });
    }
    /**
     * Catch any Node / JS error.
     */
    catchErrors() {
        // Unknowon routing get 404
        this.express.use('*', (req, res) => {
            res.statusCode = 404;
            res.send();
        });
        /**
         * Production error handler, no stacktraces leaked to the client.
         */
        this.express.use((err, req, res, next) => {
            try {
                logger_1.logger.warn(`express route crash,  req: ${req.method} ${req.path} error: ${err.message} body: ${JSON.stringify(req.body)}`);
            }
            catch (error) {
                logger_1.logger.warn(`Ok... even the crash route catcher crashd...`);
            }
            res.status(500).send();
        });
    }
}
exports.default = new App().express;
//# sourceMappingURL=app.js.map