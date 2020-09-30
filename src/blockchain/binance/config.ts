import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.bnb.contract,
    originBlock: Env.blockchain.bnb.originBlock,
    provider: Env.blockchain.bnb.provider,
    chain: Env.blockchain.bnb.chain,
    syncBlocksMargin: 100,
    abi,
};
