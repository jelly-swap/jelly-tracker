import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.harmony.contract,
    originBlock: Env.blockchain.harmony.originBlock,
    ws: Env.blockchain.harmony.ws,
    httpProvider: Env.blockchain.harmony.httpProvider,
    chain: Env.blockchain.harmony.chain,
    syncBlocksMargin: 250,
    abi,
};
