import EthereumEvent from './ethereum';
import Erc20Event from './erc20';
import AeternityEvent from './aeternity';
import BitcoinEvent from './bitcoin';

import BlockService from '../components/block/service';

import Log from '../logger';

const SYNC_PERIOD = 300000; // 5 minutes

export default async () => {
    const blockService = new BlockService();
    const ETH = new EthereumEvent();
    const ERC20 = new Erc20Event(ETH.provider);
    const BTC = new BitcoinEvent();
    const AE = new AeternityEvent();

    const events = { ETH, ERC20, BTC, AE };

    await sync(events, blockService);

    for (const chain in events) {
        const network = events[chain];
        Log.info(`Subscribe for ${chain}`);
        network.subscribe();
    }

    setInterval(async () => {
        await sync(events, blockService);
    }, SYNC_PERIOD);
};

const sync = async (events, blockService) => {
    for (const chain in events) {
        const network = events[chain];

        const lastBlock = await network.getBlock();
        const lastSyncedBlock = await blockService.getBlockNumber(chain);

        if (lastSyncedBlock) {
            Log.info(`Sync ${chain} at block ${lastSyncedBlock}`);
            await network.getPast(lastSyncedBlock - network.syncBlocksMargin);
            await blockService.update(chain, lastBlock);
        } else {
            Log.info(`Initial Sync ${chain}`);
            await network.getPast();
            await blockService.update(chain, lastBlock);
        }
    }
};
