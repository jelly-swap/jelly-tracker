import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.xdc.contract,
    originBlock: Env.blockchain.xdc.originBlock,
    provider: Env.blockchain.xdc.provider,
    chain: Env.blockchain.xdc.chain,
    syncBlocksMargin: 100,
    abi,
};
