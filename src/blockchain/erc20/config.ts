import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.erc20.contract,
    originBlock: Env.blockchain.erc20.originBlock,
    infuraKey: Env.blockchain.erc20.provider,
    chain: Env.blockchain.erc20.chain,
    syncBlocksMargin: 12,
    abi,
};
