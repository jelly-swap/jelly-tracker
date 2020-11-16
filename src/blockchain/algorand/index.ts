import axios from 'axios';

import Refund from '../../components/refund/entity';
import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';

import Config from './config';

import Emitter from '../../websocket/emitter';

export default class AlgorandEvent {
    private emitter: Emitter;
    private lastBlock: number;

    constructor() {
        this.emitter = Emitter.Instance;
    }

    async getBlock() {
        if (!this.lastBlock) {
            this.lastBlock = (await axios.get(`${Config.apiUrl}/lastBlock`)).data;
        }

        return this.lastBlock;
    }

    async subscribe() {
        setInterval(async () => {
            const lastBlock = (await axios.get(`${Config.apiUrl}/lastBlock`)).data;
            if (this.lastBlock !== lastBlock) {
                const { swaps, withdraws, refunds } = await this._getEvents(this.lastBlock);

                swaps.forEach((s: Swap) => {
                    this.emitter.emit('SWAPS', s);
                });

                withdraws.forEach((w: Withdraw) => {
                    this.emitter.emit('WITHDRAWS', w);
                });

                refunds.forEach((r: Refund) => {
                    this.emitter.emit('REFUNDS', r);
                });

                this.lastBlock = lastBlock;
            }
        }, Config.pollingInterval);
    }

    async getPast(fromBlock = 0) {
        const { swaps, withdraws, refunds } = await this._getEvents(fromBlock);

        await this.emitter.emitAsync('SWAPS', swaps);
        await this.emitter.emitAsync('WITHDRAWS', withdraws);
        await this.emitter.emitAsync('REFUNDS', refunds);
    }

    async _getEvents(fromBlock = 0) {
        const [swapResponse, withdrawResponse, refundResponse] = await Promise.all([
            axios.get(`${Config.apiUrl}/swap/block/${fromBlock}`),
            axios.get(`${Config.apiUrl}/withdraw/block/${fromBlock}`),
            axios.get(`${Config.apiUrl}/refund/block/${fromBlock}`),
        ]);

        const swaps: Swap[] = (swapResponse.data as Array<Object>).reduce((p: any, c: any) => {
            p.push({
                ...new Swap(
                    'ALGO',
                    c.transactionHash,
                    c.blockHeight,
                    c.inputAmount,
                    c.outputAmount,
                    Number(c.expiration),
                    c.id,
                    c.hashLock,
                    c.sender,
                    c.receiver,
                    c.outputNetwork,
                    c.outputAddress,
                    c.refundAddress
                ),
                expireBlock: c.expireBlock,
            });

            return p;
        }, [] as any);

        const withdraws = (withdrawResponse.data as Array<Object>).reduce((p: any, c: any) => {
            p.push(
                new Withdraw('ALGO', c.transactionHash, c.blockHeight, c.id, c.secret, c.hashLock, c.sender, c.receiver)
            );
            return p;
        }, [] as any);

        const refunds = (refundResponse.data as Array<Object>).reduce((p: any, c: any) => {
            p.push(new Refund('ALGO', c.transactionHash, c.blockHeight, c.id, c.hashLock, c.sender, c.receiver));
            return p;
        }, [] as any);

        return { swaps, withdraws, refunds };
    }
}
