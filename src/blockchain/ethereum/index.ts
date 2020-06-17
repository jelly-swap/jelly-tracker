import { Contract, providers } from 'ethers';

import Config from './config';
import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';
import Emitter from '../../websocket/emitter';
import { getRefund, getWithdraw, getSwap } from './utils';

export default class EthereumEvent {
    private provider: providers.BaseProvider;
    private contract: Contract;
    private emitter: Emitter;

    constructor() {
        this.provider = new providers.InfuraProvider('homestead', Config.infuraKey);
        this.contract = new Contract(Config.contractAddress, Config.abi, this.provider);
        this.emitter = Emitter.Instance;
    }

    subscribe() {
        this.contract.on(
            {
                address: Config.contractAddress,
            },
            (log) => {
                const baseTx = {
                    network: 'ETH',
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
                                swap.expiration.toString(),
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
                network: 'ETH',
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
                            swap.expiration.toString(),
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

        this.emitter.emit('SWAPS', swaps);
        this.emitter.on('SWAPS_COMPLETED', () => {
            this.emitter.emit('WITHDRAWS', withdraws);
            this.emitter.emit('REFUNDS', refunds);
        });
    }
}
