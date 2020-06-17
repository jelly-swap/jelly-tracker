import dotenv from 'dotenv';
import * as path from 'path';

import { getOsEnv, getOsEnvOptional, normalizePort, toBool } from './utils/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({ path: path.join(process.cwd(), `.env${process.env.NODE_ENV !== 'production' ? '.test' : ''}`) });

/**
 * Environment variables
 */

export default {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',

    app: {
        name: getOsEnv('APP_NAME'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
    },

    db: {
        type: getOsEnv('TYPEORM_CONNECTION'),
        url: getOsEnv('TYPEORM_URL'),
        synchronize: toBool(getOsEnvOptional('TYPEORM_SYNCHRONIZE')),
        logging: getOsEnv('TYPEORM_LOGGING'),
        authSource: getOsEnv('TYPEORM_AUTH_SOURCE'),
    },
};
