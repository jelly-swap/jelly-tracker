import { Node, Universal } from '@aeternity/aepp-sdk';
import axios from 'axios';
import JSONbig from 'json-bigint';
import { w3cwebsocket } from 'websocket';

import Config from './config';
import { getFunctionName, getNewSwap, getWithdraw, getRefund } from './utils';

import Refund from '../../components/refund/entity';
import Swap from '../../components/swap/entity';
import Withdraw from '../../components/withdraw/entity';
import Emitter from '../../websocket/emitter';
import Log from '../../logger';

export default class AeternityEvent {
    public readonly syncBlocksMargin = Config.syncBlocksMargin;
    private contract: any;
    private provider: any;
    private emitter: Emitter;
    private webSocketClient: w3cwebsocket;

    constructor() {
        this.emitter = Emitter.Instance;
        this.webSocketClient = new w3cwebsocket(Config.wsUrl);
    }

    async init() {
        if (!this.contract) {
            const node = await Node({ url: Config.providerUrl, internalUrl: Config.internalUrl });

            this.provider = await Universal({
                nodes: [{ name: 'JellySwap', instance: node }],
                compilerUrl: Config.compilerUrl,
            });

            this.contract = await this.provider.getContractInstance(Config.contractSource);
        }
    }

    async getBlock() {
        await this.init();
        return await this.provider.height();
    }

    async subscribe() {
        await this.init();
        this.webSocketClient.onopen = () => {
            this.webSocketClient.send(
                JSON.stringify({
                    op: 'Subscribe',
                    payload: 'Object',
                    target: Config.contractAddress,
                })
            );
        };

        this.webSocketClient.onmessage = async (message: any) => {
            if (message.type === 'message' && message.data.includes('payload')) {
                const data = JSON.parse(message.data);
                const txHash = data.payload.hash;

                if (txHash) {
                    try {
                        const tx = await this.provider.getTxInfo(txHash);

                        const fn = getFunctionName(tx);

                        if (fn) {
                            const baseTx = {
                                network: 'AE',
                                transactionHash: txHash,
                                blockNumber: tx.height,
                            };

                            const log = this.contract.decodeEvents(fn, tx.log)[0];

                            if (log) {
                                switch (log.name) {
                                    case 'NewSwap': {
                                        const swap = { ...baseTx, ...getNewSwap(log.decoded) };
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
                                        const withdraw = { ...baseTx, ...getWithdraw(log.decoded) };
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
                                        const refund = { ...baseTx, ...getRefund(log.decoded) };
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
                        }
                    } catch (err) {
                        Log.error(`Aeternity subscriber error ${err}`);
                    }
                }
            }
        };

        this.webSocketClient.onerror = (error: any) => {
            Log.error(`ERROR${error}`);
        };
    }

    async getPast(fromBlock?: number) {
        await this.init();

        return axios
            .get(`${Config.apiUrl}middleware/contracts/calls/address/${Config.contractAddress}`, {
                transformResponse: [(data: any) => data],
            })
            .then(async (res: any) => {
                const swaps: Swap[] = [];
                const withdraws: Withdraw[] = [];
                const refunds: Refund[] = [];

                JSONbig.parse(res.data).map((tx: any) => {
                    if (tx.callinfo) {
                        const fn = getFunctionName(tx.callinfo);

                        if (fn) {
                            const baseTx = {
                                network: 'AE',
                                transactionHash: tx.transaction_id,
                                blockNumber: tx.callinfo.height,
                            };

                            if (fromBlock && fromBlock > baseTx.blockNumber) {
                                return;
                            }

                            const log = this.contract.decodeEvents(fn, tx.callinfo.log)[0];

                            if (log) {
                                switch (log.name) {
                                    case 'NewSwap': {
                                        const swap = { ...baseTx, ...getNewSwap(log.decoded) };
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
                                        const withdraw = { ...baseTx, ...getWithdraw(log.decoded) };
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
                                        const refund = { ...baseTx, ...getRefund(log.decoded) };
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
                            }
                        }
                    }
                });

                await this.emitter.emitAsync('SWAPS', swaps);
                await this.emitter.emitAsync('WITHDRAWS', withdraws);
                await this.emitter.emitAsync('REFUNDS', refunds);
            });
    }
}
