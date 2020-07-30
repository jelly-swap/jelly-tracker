import Env from '../../env';

import abi from './abi';

export default {
    contractAddress: Env.blockchain.ava.contract,
    originBlock: Env.blockchain.ava.originBlock,
    infuraKey: Env.blockchain.ava.provider,
    chain: Env.blockchain.ava.chain,
    syncBlocksMargin: 12,
    abi,
};
