import Env from '../../env';
import contractSource from './countractSource';

export default {
    contractAddress: Env.blockchain.ae.contract,
    syncBlocksMargin: 50,
    apiUrl: Env.blockchain.ae.api,
    wsUrl: Env.blockchain.ae.ws,
    providerUrl: Env.blockchain.ae.provider,
    internalUrl: Env.blockchain.ae.provider,
    compilerUrl: 'https://compiler.aepps.com',
    contractSource,
};
