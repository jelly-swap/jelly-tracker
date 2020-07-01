import Env from '../../env';

export default {
    apiUrl: Env.blockchain.btc.provider,
    pollingInterval: 45000, // 45 sec
    syncBlocksMargin: 6,
};
