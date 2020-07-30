import { Contract, providers } from 'ethers';

import Config from './config';
import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';
import Emitter from '../../websocket/emitter';
import { getRefund, getWithdraw, getSwap, addressToToken } from './utils';

export default class Erc20Event {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;
    private provider: providers.BaseProvider;
    private contract: Contract;
    private emitter: Emitter;

    constructor(provider?: providers.BaseProvider) {
        this.provider = provider || new providers.InfuraProvider(Config.chain, Config.infuraKey);
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
                    transactionHash: log.transactionHash,
                    blockNumber: log.blockNumber,
                };

                switch (log.event) {
                    case 'NewContract': {
                        const swap = { ...baseTx, ...getSwap(log.args) };
                        const network = addressToToken(swap.tokenAddress);

                        this.emitter.emit(
                            'SWAPS',
                            new Swap(
                                network,
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
                        const network = addressToToken(withdraw.tokenAddress);

                        this.emitter.emit(
                            'WITHDRAWS',
                            new Withdraw(
                                network,
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
                        const network = addressToToken(refund.tokenAddress);
                        this.emitter.emit(
                            'REFUNDS',
                            new Refund(
                                network,
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
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber,
            };

            switch (log.event) {
                case 'NewContract': {
                    const swap = { ...baseTx, ...getSwap(log.args) };
                    const network = addressToToken(swap.tokenAddress);
                    swaps.push(
                        new Swap(
                            network,
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
                    const network = addressToToken(withdraw.tokenAddress);
                    withdraws.push(
                        new Withdraw(
                            network,
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
                    const network = addressToToken(refund.tokenAddress);
                    refunds.push(
                        new Refund(
                            network,
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
