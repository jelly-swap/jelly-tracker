import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.eth.contract,
    originBlock: Env.blockchain.eth.originBlock,
    providerUrl: Env.blockchain.eth.provider,
    chain: Env.blockchain.eth.chain,
    syncBlocksMargin: 12,
    abi,
};
