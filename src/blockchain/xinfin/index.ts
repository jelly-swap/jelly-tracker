import Web3 from 'xdc3';

import Config from './config';

import { getRefund, getWithdraw, getSwap } from './utils';

import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';
import Emitter from '../../websocket/emitter';

const SYNC_PERIOD = 10000; //10 seconds

export default class XinfinEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;
    public provider: any;
    private contract: any;
    private emitter: Emitter;
    private lastScanned: number;

    constructor() {
        this.provider = new Web3(Config.provider);
        this.contract = new this.provider.eth.Contract(Config.abi, Config.contractAddress);
        this.emitter = Emitter.Instance;
    }

    async getBlock() {
        return await this.provider.eth.getBlockNumber();
    }

    async subscribe() {
        setInterval(async () => {
            const latestBlock = await this.getBlock();
            await this.getPast(this.lastScanned);
            this.lastScanned = latestBlock + 1;
        }, SYNC_PERIOD);
    }

    async getPast(fromBlock?: number) {
        const swaps: Swap[] = [];
        const withdraws: Withdraw[] = [];
        const refunds: Refund[] = [];

        const result = await this.contract.getPastEvents('allEvents', {
            fromBlock: '0x' + (fromBlock || Config.originBlock).toString(16),
            toBlock: 'latest',
        });

        result.forEach((log) => {
            const baseTx = {
                network: 'XDC',
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber,
            };

            switch (log.event) {
                case 'NewContract': {
                    const swap = { ...baseTx, ...getSwap(log.returnValues) };
                    swaps.push(
                        new Swap(
                            swap.network,
                            swap.transactionHash,
                            swap.blockNumber,
                            swap.inputAmount.toString(),
                            swap.outputAmount.toString(),
                            Number(swap.expiration),
                            swap.id,
                            swap.hashLock,
                            swap.sender,
                            swap.receiver,
                            swap.outputNetwork,
                            swap.outputAddress
                        )
                    );

                    break;
                }

                case 'Withdraw': {
                    const withdraw = { ...baseTx, ...getWithdraw(log.returnValues) };
                    withdraws.push(
                        new Withdraw(
                            withdraw.network,
                            withdraw.transactionHash,
                            withdraw.blockNumber,
                            withdraw.id,
                            withdraw.secret,
                            withdraw.hashLock,
                            withdraw.sender,
                            withdraw.receiver
                        )
                    );

                    break;
                }

                case 'Refund': {
                    const refund = { ...baseTx, ...getRefund(log.returnValues) };
                    refunds.push(
                        new Refund(
                            refund.network,
                            refund.transactionHash,
                            refund.blockNumber,
                            refund.id,
                            refund.hashLock,
                            refund.sender,
                            refund.receiver
                        )
                    );

                    break;
                }
            }
        });

        await this.emitter.emitAsync('SWAPS', swaps);
        await this.emitter.emitAsync('WITHDRAWS', withdraws);
        await this.emitter.emitAsync('REFUNDS', refunds);
    }
}
