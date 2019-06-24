import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import * as fse from 'fs-extra';
import { Config, RunningMode } from './models/backendInterfaces';
import { logger } from './utilities/logger';

// load environment variable from .env file
if (existsSync('.env')) {
    dotenv.config();
}

/**
 * Read process env vars
 */
const rawHttpPort = process.env.HTTP_PORT;
const rawHttpsPort = process.env.HTTPS_PORT;
const rawUserHttps = process.env.USE_HTTPS;
const rawNodeEnv = process.env.NODE_ENV;
const rawTfaSmtpServer = process.env.TFA_SMTP_SERVER;
const rawTfaUserName = process.env.TFA_USER_NAME;
const rawTfaUserKey = process.env.TFA_USER_KEY;
const rawSaltKeys = process.env.SALT_KEYS;
const rawEncryptPass = process.env.ENCRYPT_PASS;
const rawSubnetToScan = process.env.SUBNET_TO_SCAN;

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
switch (rawNodeEnv) {
    case 'test': configuration.runningMode = 'test'; break;
    case 'debug': configuration.runningMode = 'debug'; break;
    case 'prod': configuration.runningMode = 'prod'; break;
    default: configuration.runningMode = 'prod'; break;
}

logger.info(`casa-net app running in -${configuration.runningMode}- mode (use environments vars "NODE_ENV" to change it)`);

if (!rawHttpPort) {
    logger.warn('There is no HTTP_PORT env var, using default port ' + configuration.http.httpPort);
} else {
    configuration.http.httpPort = parseInt(rawHttpPort, 10);
}

if (!rawHttpsPort) {
    logger.warn('There is no HTTP_PORTS env var, using default port ' + configuration.http.httpsPort);
} else {
    configuration.http.httpsPort = parseInt(rawHttpsPort, 10);
}

if (!rawUserHttps) {
    logger.warn('There is no USE_HTTPS env var, using default, ' + configuration.http.useHttps);
} else {
    configuration.http.useHttps = rawUserHttps.toLowerCase() !== 'false';
}

if (rawTfaSmtpServer && rawTfaUserName && rawTfaUserKey) {
    configuration.twoStepsVerification = {
        TwoStepEnabled: true,
        smtpServer: rawTfaSmtpServer,
        userKey: rawTfaUserKey,
        userName: rawTfaUserName,
    };
} else {
    logger.warn('The 2-step verification in disabled, to enable it set TFA_SMTP_SERVER TFA_USER_NAME TFA_USER_KEY env var correct value.');
    configuration.twoStepsVerification = {
        TwoStepEnabled: false,
        smtpServer: '',
        userKey: '',
        userName: '',
    };
}

if (!rawEncryptPass) {
    logger.fatal('There is no ENCRYPT_PASS env var, generating random you must have it, exit...');
    process.exit();
}

if (!rawSaltKeys) {
    logger.fatal('There is no SALT_KEYS env var, exit..');
    process.exit();
}

configuration.keysHandling = {
    dataPasswprd: rawEncryptPass,
    saltHash: rawSaltKeys,
    bcryptSaltRounds: 12,
};

if (!rawSubnetToScan) {
    logger.warn('There is no SUBNET_TO_SCAN env var, the default subnet is current machine ip subnet.');
}

configuration.scanSubnet = rawSubnetToScan;

/** System configuration */
export const Configuration: Config = configuration;
