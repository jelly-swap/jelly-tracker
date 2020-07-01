import { DateTime } from 'luxon';
import { STATUS } from './constants';
import SwapRepository from './repository';
import Emitter from '../../websocket/emitter';
import Swap from './entity';

const ADDITIONAL_TIME = { BTC: 3600 };
const TIMESTAMP_DIVISOR = { AE: 1000 };
const PERIOD = 1 * 60 * 1000; // 5 minutes

export class StatusTracker {
    public name: string;

    private swapRepository: SwapRepository;

    constructor() {
        this.name = 'StatusTracker';
        this.swapRepository = new SwapRepository();
    }

    async trackStatus() {
        const currentTimestamp = DateTime.local().toSeconds();
        const activeSwaps = await this.swapRepository.getByStatus(STATUS.ACTIVE);

        const expiredSwaps = activeSwaps.reduce((result, swap) => {
            const divisor = TIMESTAMP_DIVISOR[swap.network] || 1;
            const additionalTime = ADDITIONAL_TIME[swap.network] || 0;

            const expiration = swap.expiration / divisor + additionalTime;

            if (expiration < currentTimestamp) {
                result.push(swap);
            }

            return result;
        }, [] as any) as Swap[];

        await this.swapRepository.updateMany(expiredSwaps, STATUS.EXPIRED);

        expiredSwaps.forEach((swap) => {
            const { id, sender, receiver, network, outputNetwork } = swap;
            Emitter.Instance.emit('WS_MESSAGE', {
                topic: 'Expired',
                data: { id, sender, receiver, network, outputNetwork, status: STATUS.EXPIRED },
            });
        });
    }

    async start() {
        await this.trackStatus();

        setInterval(async () => {
            await this.trackStatus();
        }, PERIOD);
    }
}
