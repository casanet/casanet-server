import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as forceSsl from 'express-force-ssl';
import * as rateLimit from 'express-rate-limit';
import * as fse from 'fs-extra';
import { sanitizeExpressMiddleware } from 'generic-json-sanitizer';
import * as helmet from 'helmet';
import * as path from 'path';
import { RemoteConnectionBlSingleton } from './business-layer/remoteConnectionBl';
import { Configuration } from './config';
import { FeedRouter } from './routers/feedRoute';
import { RegisterRoutes } from './routers/routes';
import { logger } from './utilities/logger';
import * as swaggerUi from 'swagger-ui-express';
import * as cors from 'cors';

// controllers need to be referenced in order to get crawled by the TSOA generator

class App {
	public express: express.Express;
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

		/** Load instance to remote server connection logic. */
		this.loadRemoteServerConnection();

		/** Finlay route to API */
		this.routes();

		/** Serve static client side assets */
		this.serveStatic();

		/** Serve swagger docs UI */
		this.serveDocs();

		/** And never sent errors back to the client. */
		this.catchErrors();
	}

	/**
	 * Serve static files of front-end.
	 */
	private serveStatic() {
		/** In / path only serve the index.html file */
		this.express.get('/', (req: express.Request, res: express.Response) =>
			res.sendFile(path.join(__dirname, '/public/index.html')),
		);

		/** Get any file in public directory */
		this.express.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			const filePath = path.join(__dirname, '/public/', req.url);
			fse.exists(filePath, exists => {
				if (exists) {
					res.sendFile(filePath);
				} else {
					next();
				}
			});
		});
	}

	/**
	 * Route requests to API.
	 */
	private routes(): void {

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
			windowMs: 15 * 60 * 1000, // 5 minutes
			max: 20,
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


		// Open CORS to let frontend apps API access.
		const { ALLOW_DASHBOARD_ORIGINS } = process.env;

		// Get the domains (separated by ',') or use the default domains
		const whitelist = ALLOW_DASHBOARD_ORIGINS ? ALLOW_DASHBOARD_ORIGINS.split(',') : ['http://127.0.0.1:3000', 'http://localhost:3000'];

		logger.info('Opening CORS for the following origins:');
		// eslint-disable-next-line no-console
		console.table(whitelist);
		this.express.use(
			cors({
				credentials: true,
				origin: (origin, callback) => {
					/** If origin not sent (mean it`s same origin) or origin match white list, allow it. */
					if (!origin || whitelist.indexOf(origin) !== -1) {
						callback(null, true);
					} else {
						callback(new Error(`${origin} not allowed by CORS`));
					}
				},
			})
		);
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

	private serveDocs(): void {
		this.express.use('/docs', swaggerUi.serve, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			return res.send(swaggerUi.generateHTML(await import('./swagger.json')));
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
				logger.warn(
					`express route crash,  req: ${req.method} ${req.path} error: ${err.message} body: ${JSON.stringify(
						req.body,
					)}`,
				);
			} catch (error) {
				logger.warn(`Ok... even the crash route catcher crashd...`);
			}
			res.status(500).send();
		});
	}
}

export const app = new App().express;
