import axios from 'axios';

import Refund from '../../components/refund/entity';
import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';

import Config from './config';

import Emitter from '../../websocket/emitter';

export default class BitcoinEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;
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
                const { swaps, withdraws, refunds } = await this._getEvents(lastBlock);

                swaps.forEach((s: Swap) => {
                    this.emitter.emit('SWAPS', s);
                });

                withdraws.forEach((w: Withdraw) => {
                    this.emitter.emit('WITHDRAWS', withdraws);
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
        const swapResponse = await axios.get(`${Config.apiUrl}/swap/block/${fromBlock}`);
        const swaps: Swap[] = (swapResponse.data as Array<Object>).reduce((p: any, c: any) => {
            p.push(
                new Swap(
                    'BTC',
                    c.transactionHash,
                    c.blockHeight,
                    c.inputAmount,
                    c.outputAmount,
                    c.expiration,
                    c.id,
                    c.hashLock,
                    c.sender,
                    c.receiver,
                    c.outputNetwork,
                    c.outputAddress,
                    c.refundAddress
                )
            );

            return p;
        }, [] as any);

        const withdrawResponse = await axios.get(`${Config.apiUrl}/withdraw/block/${fromBlock}`);
        const withdraws = (withdrawResponse.data as Array<Object>).reduce((p: any, c: any) => {
            p.push(
                new Withdraw('BTC', c.transactionHash, c.blockHeight, c.id, c.secret, c.hashLock, c.sender, c.receiver)
            );
            return p;
        }, [] as any);

        const refundResponse = await axios.get(`${Config.apiUrl}/refund/block/${fromBlock}`);
        const refunds = (refundResponse.data as Array<Object>).reduce((p: any, c: any) => {
            p.push(new Refund('BTC', c.transactionHash, c.blockHeight, c.id, c.hashLock, c.sender, c.receiver));
            return p;
        }, [] as any);

        return { swaps, withdraws, refunds };
    }
}
