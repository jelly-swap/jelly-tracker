import { Contract, providers } from 'ethers';

import Config from './config';

import { getRefund, getWithdraw, getSwap } from './utils';

import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';

import Emitter from '../../websocket/emitter';

export default class AvalancheEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;
    public provider: providers.BaseProvider;
    private contract: Contract;
    private emitter: Emitter;

    constructor() {
        this.provider = new providers.JsonRpcProvider(Config.provider);
        this.contract = new Contract(Config.contractAddress, Config.abi, this.provider);
        this.emitter = Emitter.Instance;
    }

    async getBlock() {
        return await this.provider.getBlockNumber();
    }

    subscribe() {
        this.contract.on(
            {
                address: Config.contractAddress,
            },
            (log) => {
                const baseTx = {
                    network: 'AVA',
                    transactionHash: log.transactionHash,
                    blockNumber: log.blockNumber,
                };

                switch (log.event) {
                    case 'NewContract': {
                        const swap = { ...baseTx, ...getSwap(log.args) };
                        this.emitter.emit(
                            'SWAPS',
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
                        const withdraw = { ...baseTx, ...getWithdraw(log.args) };
                        this.emitter.emit(
                            'WITHDRAWS',
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
                        const refund = { ...baseTx, ...getRefund(log.args) };
                        this.emitter.emit(
                            'REFUNDS',
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
            }
        );
    }

    async getPast(fromBlock?: number) {
        const swaps: Swap[] = [];
        const withdraws: Withdraw[] = [];
        const refunds: Refund[] = [];

        const result = await this.contract.queryFilter(
            {
                address: Config.contractAddress,
            },
            fromBlock || Config.originBlock
        );

        result.forEach((log) => {
            const baseTx = {
                network: 'AVA',
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber,
            };

            switch (log.event) {
                case 'NewContract': {
                    const swap = { ...baseTx, ...getSwap(log.args) };
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
                    const withdraw = { ...baseTx, ...getWithdraw(log.args) };
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
                    const refund = { ...baseTx, ...getRefund(log.args) };
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
