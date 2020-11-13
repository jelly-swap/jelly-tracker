import EthereumEvent from './ethereum';
import Erc20Event from './erc20';
import AeternityEvent from './aeternity';
import BitcoinEvent from './bitcoin';
import AlgorandEvent from './algorand';
import HarmonyEvent from './harmony';
import AvalancheEvent from './avalanche';
import MaticEvent from './matic';
import BinanceEvent from './binance';

import BlockService from '../components/block/service';

import Log from '../logger';
import Env from '../env';

const SYNC_PERIOD = 300000; // 5 minutes

const Networks = {
    ETH: EthereumEvent,
    ERC20: Erc20Event,
    BTC: BitcoinEvent,
    AE: AeternityEvent,
    ONE: HarmonyEvent,
    AVA: AvalancheEvent,
    MATIC: MaticEvent,
    BNB: BinanceEvent,
    ALGO: AlgorandEvent,
};

export default async () => {
    const blockService = new BlockService();
    const networks = Env.blockchain.networks;

    const events = networks.reduce((result, n) => {
        if (n === 'ERC20' && result['ETH']) {
            result[n] = new Networks[n](result['ETH'].provider);
        }

        result[n] = new Networks[n]();

        return result;
    }, {} as any);

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
        try {
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
        } catch (err) {
            Log.error(`Sync error ${err}`);
        }
    }
};
