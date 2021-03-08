import Web3 from 'xdc3';


import Config from './config';

import { getRefund, getWithdraw, getSwap } from './utils';

import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';

import Emitter from '../../websocket/emitter';
import Logger from '../../logger';

export default class AvalancheEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;
    public provider: any;
    private contract: any;
    private emitter: Emitter;
    private web3: any;

    constructor() {
        this.web3 = new Web3(Config.provider);
        this.provider = new this.web3.providers.HttpProvider(Config.provider);
        this.contract = new this.web3.eth.Contract(Config.abi, Config.contractAddress);
        this.emitter = Emitter.Instance;
    }

    async getBlock() {
        return await this.web3.eth.getBlockNumber();
    }

    subscribe(){
        this.contract.events
            .NewContract()
            .on('data', (event) => {
                const baseTx = {
                    network: 'XDC',
                    transactionHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber),
                };
                const swap = { ...baseTx, ...getSwap(event.returnValues) };

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
            })
            .on('error', (err) => Logger.error(`Xinfin NewContract ${err}`));

        this.contract.events
            .Withdraw()
            .on('data', (event) => {
                const baseTx = {
                    network: 'XDC',
                    transactionHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber),
                };
                const withdraw = { ...baseTx, ...getWithdraw(event.returnValues) };

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
            })
            .on('error', (err) => Logger.error(`Xinfin Withdraw ${err}`));

        this.contract.events
            .Refund()
            .on('data', (event) => {
                const baseTx = {
                    network: 'XDC',
                    transactionHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber),
                };
                const refund = { ...baseTx, ...getRefund(event.returnValues) };

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
            })
            .on('error', (err) => Logger.error(`XDC Refund ${err}`));       
    }

    async getPast(fromBlock?: number) {
        const swaps: Swap[] = [];
        const withdraws: Withdraw[] = [];
        const refunds: Refund[] = [];

        const result = await this.contract.getPastEvents('allEvents',
            {
                fromBlock: '0x' + (fromBlock || Config.originBlock).toString(16),
                toBlock: 'latest'
            },
        );

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
