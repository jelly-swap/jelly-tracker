import { ContractFactory, Contract } from '@harmony-js/contract';
import { Blockchain } from '@harmony-js/core';
import { Wallet } from '@harmony-js/account';
import { toBech32 } from '@harmony-js/crypto';
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
            new Messenger(new WSProvider('wss://ws.s0.b.hmny.io'), ChainType.Harmony, Config.chain)
        );
        const factory = new ContractFactory(this.wallet);

        this.contract = factory.createContract(Config.abi, Config.contractAddress);

        this.blockchain = new Blockchain(this.wallet.messenger);

        this.emitter = Emitter.Instance;
    }

    async getBlock() {
        const blockNumber = await this.blockchain.getBlockNumber();
        return blockNumber.result || 0;
    }

    subscribe() {
        this.contract.events
            .NewContract()
            .on('data', (event) => {
                console.log('NewContract', event);

                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                };
                const swap = { ...baseTx, ...getSwap(event.returnValues) };

                const sender = toBech32(swap.sender);
                const receiver = toBech32(swap.receiver);

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
                        sender,
                        receiver,
                        swap.outputNetwork,
                        swap.outputAddress
                    )
                );
            })
            .on('error', console.error);

        this.contract.events
            .Withdraw()
            .on('data', (event) => {
                console.log('Withdraw', event);

                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                };
                const withdraw = { ...baseTx, ...getWithdraw(event.returnValues) };

                const sender = toBech32(withdraw.sender);
                const receiver = toBech32(withdraw.receiver);

                this.emitter.emit(
                    'WITHDRAWS',
                    new Withdraw(
                        withdraw.network,
                        withdraw.transactionHash,
                        withdraw.blockNumber,
                        withdraw.id,
                        withdraw.secret,
                        withdraw.hashLock,
                        sender,
                        receiver
                    )
                );
            })
            .on('error', console.error);

        this.contract.events
            .Refund()
            .on('data', (event) => {
                console.log('Refund', event);

                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                };
                const refund = { ...baseTx, ...getRefund(event.returnValues) };

                const sender = toBech32(refund.sender);
                const receiver = toBech32(refund.receiver);

                this.emitter.emit(
                    'REFUNDS',
                    new Refund(
                        refund.network,
                        refund.transactionHash,
                        refund.blockNumber,
                        refund.id,
                        refund.hashLock,
                        sender,
                        receiver
                    )
                );
            })
            .on('error', console.error);
    }

    async getPast(fromBlock?: number) {
        // console.log('tuka sam');
        // console.log({
        //     fromBlock: Config.originBlock,
        //     toBlock: 'latest',
        //     address: Config.contractAddress,
        // });
        // this.blockchain
        //     .logs({
        //         fromBlock: Config.originBlock,
        //         // toBlock: 'latest',
        //         address: Config.contractAddress,
        //     })
        //     .on('data', (event) => {
        //         console.log(event);
        //     })
        //     .on('error', (err) => {
        //         console.log(err);
        //     });
        //TODO: implement get past service. Wait for Harmony dev team's input.
        // await this.emitter.emitAsync('SWAPS', swaps);
        // await this.emitter.emitAsync('WITHDRAWS', withdraws);
        // await this.emitter.emitAsync('REFUNDS', refunds);
    }
}
