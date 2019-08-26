"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const forceSsl = require("express-force-ssl");
const rateLimit = require("express-rate-limit");
const generic_json_sanitizer_1 = require("generic-json-sanitizer");
const helmet = require("helmet");
const path = require("path");
const config_1 = require("../../backend/src/config");
const logger_1 = require("../../backend/src/utilities/logger");
const feedRoute_1 = require("./routers/feedRoute");
const forwardingsIftttRoute_1 = require("./routers/forwardingsIftttRoute");
const forwardingsRoute_1 = require("./routers/forwardingsRoute");
const routes_1 = require("./routers/routes");
// controllers need to be referenced in order to get crawled by the TSOA generator
require("./controllers/administration-admins-controller");
require("./controllers/administration-auth-controller");
require("./controllers/feed-controller");
require("./controllers/forward-auth-controller");
require("./controllers/local-servers-controller");
require("./controllers/management-assets-controller");
require("./controllers/static-assets-controller");
const { APP_BEHIND_PROXY, APP_BEHIND_PROXY_REDIRECT_HTTPS } = process.env;
class App {
    constructor() {
        this.feedRouter = new feedRoute_1.FeedRouter();
        this.forwardingRouter = new forwardingsRoute_1.ForwardingRouter();
        this.forwardingIftttRouter = new forwardingsIftttRoute_1.ForwardingIftttRouter();
        /** Creat the express app */
        this.express = express();
        /** Take care with app that runs behind proxy (Heroku, Nginx, etc) */
        if (APP_BEHIND_PROXY === 'true') {
            this.appBehindProxy();
        }
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
    serveStatic() {
        /** In / path only serve the index.html file */
        this.express.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/static/index.html')));
        /** Get any file in public directory */
        this.express.use('/static', express.static(path.join(__dirname, '/public/static/')));
    }
    /**
     * Serve management static files of.
     */
    serveManagementStatic() {
        /** In /management path only serve the management index.html file */
        this.express.get('/management', (req, res) => res.sendFile(path.join(__dirname, '/public/management/index.html')));
        /** Get any file in management public directory */
        this.express.use('/management', express.static(path.join(__dirname, '/public/management/')));
    }
    /**
     * Route requests to API.
     */
    routes() {
        /** Route local systems system feed */
        this.feedRouter.routes(this.express);
        /** Use generated routers (by TSOA) */
        routes_1.RegisterRoutes(this.express);
    }
    /**
     * Forward each casa API request to user local server AS IS.
     */
    forwardingToLocal() {
        this.forwardingIftttRouter.forwardRouter(this.express);
        this.forwardingRouter.forwardRouter(this.express);
    }
    /**
     * Take care with app that runs behind proxy (Heroku, Nginx, etc).
     * mark proxy as trust, and redirect to HTTPS if need.
     */
    appBehindProxy() {
        this.express.set('trust proxy', 1);
        if (APP_BEHIND_PROXY_REDIRECT_HTTPS !== 'true') {
            return;
        }
        /** Redirect to https behaind proxy / elastic load balancer */
        this.express.use((req, res, next) => {
            const xfp = req.headers['X-Forwarded-Proto'] || req.headers['x-forwarded-proto'];
            if (xfp === 'http') {
                res.redirect(301, `https://${req.hostname}${req.url}`);
            }
            else {
                next();
            }
        });
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
        //  apply to all  IP requests
        this.express.use(limiter);
        // Protect authentication API from guessing username/password.
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
        });
        // apply to all authentication requests
        this.express.use('/API/administration/auth/**', authLimiter);
        // Use to redirect http to https/ssl
        if (config_1.Configuration.http.useHttps) {
            this.express.use(forceSsl);
        }
        // Use to redirect http to https/ssl
        if (config_1.Configuration.http.useHttps) {
            this.express.use(forceSsl);
        }
        // Protect from XSS and other malicious attacks
        this.express.use(helmet());
        this.express.use(helmet.frameguard({ action: 'deny' }));
        const whitelist = [
            process.env.ALLOW_DASHBOARD_ORIGIN || 'http://192.168.1.104:8080',
            process.env.ALLOW_MANAGEMENT_ORIGIN || 'http://127.0.0.1:8080'
        ];
        this.express.use(cors({
            credentials: true,
            origin: (origin, callback) => {
                if (whitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            }
        }));
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
         * Production error handler, no stacktraces leaked to user.
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