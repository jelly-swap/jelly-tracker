import dotenv from 'dotenv';
import * as path from 'path';

import { getOsEnv, getOsEnvOptional, getOsEnvArray, normalizePort, toBool, toNumber } from './utils/env';

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

    blockchain: {
        networks: getOsEnvArray('NETWORKS'),

        eth: {
            provider: getOsEnv('ETH_PROVIDER'),
            contract: getOsEnv('ETH_CONTRACT'),
            originBlock: toNumber(getOsEnv('ETH_ORIGIN_BLOCK')),
            chain: getOsEnv('ETH_CHAIN'),
        },

        erc20: {
            provider: getOsEnv('ERC20_PROVIDER'),
            contract: getOsEnv('ERC20_CONTRACT'),
            originBlock: toNumber(getOsEnv('ERC20_ORIGIN_BLOCK')),
            chain: getOsEnv('ERC20_CHAIN'),
        },

        btc: {
            provider: getOsEnv('BTC_PROVIDER'),
        },

        algo: {
            provider: getOsEnv('ALGO_PROVIDER'),
        },

        ae: {
            api: getOsEnv('AE_API'),
            ws: getOsEnv('AE_WS'),
            provider: getOsEnv('AE_PROVIDER'),
            contract: getOsEnv('AE_CONTRACT'),
        },

        harmony: {
            ws: getOsEnv('HARMONY_WS'),
            httpProvider: getOsEnv('HARMONY_HTTP_RPOVIDER'),
            contract: getOsEnv('HARMONY_CONTRACT'),
            originBlock: getOsEnv('HARMONY_ORIGIN_BLOCK'),
            chain: toNumber(getOsEnv('HARMONY_CHAIN')),
        },

        ava: {
            provider: getOsEnv('AVA_PROVIDER'),
            contract: getOsEnv('AVA_CONTRACT'),
            originBlock: toNumber(getOsEnv('AVA_ORIGIN_BLOCK')),
            chain: getOsEnv('AVA_CHAIN'),
        },

        bnb: {
            provider: getOsEnv('BNB_PROVIDER'),
            contract: getOsEnv('BNB_CONTRACT'),
            originBlock: toNumber(getOsEnv('BNB_ORIGIN_BLOCK')),
            chain: getOsEnv('BNB_CHAIN'),
        },

        xdc: {
            provider: getOsEnv('XDC_PROVIDER'),
            contract: getOsEnv('XDC_CONTRACT'),
            originBlock: toNumber(getOsEnv('XDC_ORIGIN_BLOCK')),
            chain: getOsEnv('XDC_CHAIN'),
        },

        matic: {
            provider: getOsEnv('MATIC_PROVIDER'),
            contract: getOsEnv('MATIC_CONTRACT'),
            originBlock: toNumber(getOsEnv('MATIC_ORIGIN_BLOCK')),
            chain: getOsEnv('MATIC_CHAIN'),
        },
    },
};
