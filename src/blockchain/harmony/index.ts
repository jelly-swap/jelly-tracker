import { ContractFactory, Contract } from '@harmony-js/contract';
import { Blockchain } from '@harmony-js/core';
import { Wallet } from '@harmony-js/account';
import { toBech32, BN } from '@harmony-js/crypto';
import { Messenger, WSProvider, HttpProvider } from '@harmony-js/network';
import { ChainType } from '@harmony-js/utils';

import Config from './config';

import { getRefund, getWithdraw, getSwap } from './utils';

import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Refund from '../../components/refund/entity';

import Emitter from '../../websocket/emitter';
import Logger from '../../logger';

export default class EthereumEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;

    private wallet: Wallet;
    private contract: Contract;
    private blockchain: Blockchain;
    private logsMessenger: Messenger;

    private emitter: Emitter;

    constructor() {
        this.wallet = new Wallet(new Messenger(new WSProvider(Config.ws), ChainType.Harmony, Config.chain));
        const factory = new ContractFactory(this.wallet);

        this.contract = factory.createContract(Config.abi, Config.contractAddress);

        this.blockchain = new Blockchain(this.wallet.messenger);

        this.logsMessenger = new Messenger(new HttpProvider(Config.httpProvider));

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
                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber),
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
            .on('error', (err) => Logger.error(`Harmony NewContract ${err}`));

        this.contract.events
            .Withdraw()
            .on('data', (event) => {
                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber),
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
            .on('error', (err) => Logger.error(`Harmony Withdraw ${err}`));

        this.contract.events
            .Refund()
            .on('data', (event) => {
                const baseTx = {
                    network: 'ONE',
                    transactionHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber),
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
            .on('error', (err) => Logger.error(`Harmony Refund ${err}`));
    }

    async getPast(__fromBlock?: number) {
        const block = await this.getBlock();
        const fromBlock = '0x' + new BN(parseInt(block) - this.syncBlocksMargin).toString('hex');

        if (block > 0) {
            const swaps: Swap[] = [];
            const withdraws: Withdraw[] = [];
            const refunds: Refund[] = [];

            const logs = await this.logsMessenger.send('hmy_getLogs', [
                {
                    fromBlock,
                    toBlock: 'latest',
                    address: Config.contractAddress,
                },
            ]);

            logs?.result?.forEach((log) => {
                const topics = log.topics;

                const baseTx = {
                    network: 'ONE',
                    transactionHash: log.transactionHash,
                    blockNumber: parseInt(log.blockNumber),
                };

                switch (topics[0]) {
                    case '0x767d0ffbc3d16cc51fc05770a22976e4b0fda9198e37878b76979429b2d5d88c': {
                        const inputs = this.contract.abiModel.getEvent('NewContract').inputs;
                        const decoded = this.contract.abiCoder.decodeLog(inputs, log.data, log.topics);
                        const swap = { ...baseTx, ...getSwap(decoded) };

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

                    case '0x6fa50d56c31f3efe0cb6ff06232bffce8fe8c4155e3cbb6f2d79dd12631c2522': {
                        const inputs = this.contract.abiModel.getEvent('Refund').inputs;
                        const decoded = this.contract.abiCoder.decodeLog(inputs, log.data, log.topics);
                        const refund = { ...baseTx, ...getRefund(decoded) };
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

                    case '0x2d3a5ed13d0553389b4078e01264416362e34d23520fda797fbc17f3905ed131': {
                        const inputs = this.contract.abiModel.getEvent('Withdraw').inputs;
                        const decoded = this.contract.abiCoder.decodeLog(inputs, log.data, log.topics);
                        const withdraw = { ...baseTx, ...getWithdraw(decoded) };
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

                    default: {
                        break;
                    }
                }
            });

            await this.emitter.emitAsync('SWAPS', swaps);
            await this.emitter.emitAsync('WITHDRAWS', withdraws);
            await this.emitter.emitAsync('REFUNDS', refunds);
        }
    }
}
