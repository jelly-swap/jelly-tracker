import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.matic.contract,
    originBlock: Env.blockchain.matic.originBlock,
    provider: Env.blockchain.matic.provider,
    chain: Env.blockchain.matic.chain,
    syncBlocksMargin: 12,
    abi,
};
