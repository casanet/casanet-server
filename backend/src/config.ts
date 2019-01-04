import * as fse from 'fs-extra';
import { Config, RunningMode } from './models/backendInterfaces';
import { logger } from './utilities/logger';

/**
 * Read process env vars
 */
const rowHttpPort = process.env.HTTP_PORT;
const rowHttpsPort = process.env.HTTPS_PORT;
const rowUserHttps = process.env.USE_HTTPS;
const rowNodeEnv = process.env.NODE_ENV;

/**
 * Read casanet configuration file.
 */
let configuration: Config;
try {
    configuration = fse.readJSONSync('casanet.json');
} catch (error) {
    logger.error('Fail to read casanet.json configuration file. exit...');
    process.exit();
}

/**
 * Set running mode.
 */
switch (rowNodeEnv) {
    case 'test': configuration.runningMode = 'test'; break;
    case 'debug': configuration.runningMode = 'debug'; break;
    case 'prod': configuration.runningMode = 'prod'; break;
    default: configuration.runningMode = 'prod'; break;
}

logger.info(`casa-net app running in -${configuration.runningMode}- mode (use environments vars to change it)`);

if (!rowHttpPort) {
    logger.warn('There is no HTTP_PORT env var, using default port ' + configuration.http.httpPort);
} else {
    configuration.http.httpPort = parseInt(rowHttpPort, 10);
}

if (!rowHttpsPort) {
    logger.warn('There is no HTTP_PORTS env var, using default port ' + configuration.http.httpsPort);
} else {
    configuration.http.httpsPort = parseInt(rowHttpsPort, 10);
}

if (!rowUserHttps) {
    logger.warn('There is no USE_HTTPS env var, using default, ' + configuration.http.useHttps);
} else {
    configuration.http.useHttps = rowUserHttps.toLowerCase() !== 'false';
}

/** System configuration */
export const Configuration: Config = configuration;
