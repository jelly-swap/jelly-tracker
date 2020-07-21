import { ContractFactory, Contract } from '@harmony-js/contract';
import { Blockchain } from '@harmony-js/core';
import { Wallet } from '@harmony-js/account';
import { Messenger, WSProvider } from '@harmony-js/network';
import { ChainType } from '@harmony-js/utils';

import Config from './config';

import { getRefund, getWithdraw, getSwap } from './utils';

import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';

import Emitter from '../../websocket/emitter';

export default class EthereumEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;

    private wallet: Wallet;
    private contract: Contract;
    private blockchain: Blockchain;

    private emitter: Emitter;

    constructor() {
        this.wallet = new Wallet(
            new Messenger(new WSProvider('wss://ws.s1.b.hmny.io'), ChainType.Harmony, Config.chain)
        );
        const factory = new ContractFactory(this.wallet);

        this.contract = factory.createContract(Config.abi, Config.contractAddress);

        this.blockchain = new Blockchain(this.wallet.messenger);

        this.emitter = Emitter.Instance;
    }

    async getBlock() {
        return await this.blockchain.getBlockNumber();
    }

    subscribe() {
        this.contract.events
            .NewContract()
            .on('data', (event) => {
                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
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
            .on('error', console.error);

        this.contract.events
            .Withdraw()
            .on('data', (event) => {
                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
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
            .on('error', console.error);

        this.contract.events
            .Refund()
            .on('data', (event) => {
                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
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
            .on('error', console.error);
    }

    async getPast(fromBlock?: number) {
        //TODO: implement get past service. Wait for Harmony dev team's input.
        // await this.emitter.emitAsync('SWAPS', swaps);
        // await this.emitter.emitAsync('WITHDRAWS', withdraws);
        // await this.emitter.emitAsync('REFUNDS', refunds);
    }
}
