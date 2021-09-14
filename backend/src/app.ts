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
import { ErrorResponse } from './models/sharedInterfaces';

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
		this.serveDashboard();
		this.serveLegacyDashboard();

		/** Serve swagger docs UI */
		this.serveDocs();

		/** And never sent errors back to the client. */
		this.catchErrors();
	}

	/**
	 * Serve static files of front-end.
	 */
	private serveLegacyDashboard() {
		/** In / path only serve the index.html file */
		this.express.get('/v3', (req: express.Request, res: express.Response) =>
			res.sendFile(path.join(__dirname, '/public/index.html')),
		);

		/** Get any file in public directory */
		this.express.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

			// The v3 dashboard assets placed in the public dir, so redirect thr V3 requests to there.
			let url = req.url || '';
			if (url.startsWith('v3') || url.startsWith('/v3')) {
				url = url.replace('v3', 'public');
			} else {
				next();
				return;
			}

			const filePath = path.join(__dirname, url);
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
	 * Serve new dashboard files.
	 */
	private serveDashboard() {
		/** In / path only serve the index.html file */
		this.express.get('/', (req: express.Request, res: express.Response) =>
			res.sendFile(path.join(__dirname, '/dashboard/index.html')),
		);

		/** Get any file in public directory */
		this.express.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			const filePath = path.join(__dirname, '/dashboard/', req.url);
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
			max: 100,
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

		this.express.use(
			cors({
				credentials: true,
				origin: (origin, callback) => {
					// The local server is used by same origin only, only in dev the dashboard is cross and the auth is by header
					callback(null, true);
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
		this.express.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

			try {
				if (err?.responseCode) {
					const responseError = err as ErrorResponse;
					const resCode = responseError.responseCode % 1000;
					logger.error(`[REST_ERROR] request ${req.method} ${req.path} failed, sending error "${resCode}" to client with payload: ${JSON.stringify(responseError)}`)
					res.status(resCode).json(responseError);
					return;
				}

				logger.error(
					`express route crash,  req: ${req.method} ${req.path} error: ${err.message} body: ${JSON.stringify(
						req.body,
					)}`,
				);
			} catch (error) {
				logger.error(`Ok... even the crash route catcher crashed...`);
			}
			res.status(500).send();
		});
	}
}

export const app = new App().express;
