import Env from '../../env';

export default {
    apiUrl: Env.blockchain.algo.provider,
    pollingInterval: 10000, // 10 sec
    syncBlocksMargin: 6,
};
