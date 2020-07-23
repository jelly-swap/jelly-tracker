import { ObjectLiteral, getMongoRepository } from 'typeorm';

import Swap from './entity';

import Log from '../../logger';
import { cmpIgnoreCase } from '../../utils/common';
import Emitter from '../../websocket/emitter';

export default class SwapRepository {
    private swapRepository = getMongoRepository(Swap);

    async getAll() {
        return await this.swapRepository.find();
    }

    async getByAddress(address: string) {
        const swaps = await this.swapRepository.find({
            where: {
                $or: [{ receiver: address }, { sender: address }, { outputAddress: address }],
            },
        });

        const inputSwaps = swaps.filter((swap) => cmpIgnoreCase(swap.sender, address));
        const outputSwaps = swaps.filter((swap) => !cmpIgnoreCase(swap.sender, address));
        return this.getInputSwaps(inputSwaps, outputSwaps);
    }

    async getByAddressAfter(address: string, timestamp: string) {
        const swaps = await this.swapRepository.find({
            where: {
                $and: [
                    { $or: [{ sender: address }, { receiver: address }, { outputAddress: address }] },
                    { expiration: { $gte: Number(timestamp) } },
                ],
            },
        });

        const inputSwaps = swaps.filter((swap) => cmpIgnoreCase(swap.sender, address));
        const outputSwaps = swaps.filter((swap) => !cmpIgnoreCase(swap.sender, address));
        return this.getInputSwaps(inputSwaps, outputSwaps);
    }

    async getByAddressesAfter(addresses: string[], timestamp: string) {
        const swaps = await this.swapRepository.find({
            where: {
                $and: [
                    {
                        $or: [
                            { receiver: { $in: addresses } },
                            { sender: { $in: addresses } },
                            { outputAddress: { $in: addresses } },
                        ],
                    },
                    { expiration: { $gte: Number(timestamp) } },
                ],
            },
        });

        const inputSwaps = swaps.filter((swap) => addresses.some((s) => cmpIgnoreCase(swap.sender, s)));
        const outputSwaps = swaps.filter((swap) => !addresses.some((s) => cmpIgnoreCase(swap.sender, s)));
        return this.getInputSwaps(inputSwaps, outputSwaps);
    }

    async getByReceiverAfter(receiver: string, timestamp: string) {
        const swaps = await this.swapRepository.find({
            where: {
                $and: [{ receiver }, { expiration: { $gte: Number(timestamp) } }],
            },
        });
        return swaps;
    }

    async getByReceiversAfter(receivers: string[], timestamp: string) {
        const swaps = await this.swapRepository.find({
            where: {
                $and: [{ receiver: { $in: receivers } }, { expiration: { $gte: Number(timestamp) } }],
            },
        });
        return swaps;
    }

    async getByStatus(status: number) {
        const swaps = await this.swapRepository.find({ status });
        return this.getInputSwaps(swaps, swaps);
    }

    async getByAddressAndStatus(address: string, status: number) {
        const swaps = await this.swapRepository.find({
            where: {
                $and: [{ $or: [{ receiver: address }, { sender: address }] }, { status }],
            },
        });

        const inputSwaps = swaps.filter((swap) => cmpIgnoreCase(swap.sender, address));
        const outputSwaps = swaps.filter((swap) => !cmpIgnoreCase(swap.sender, address));
        return this.getInputSwaps(inputSwaps, outputSwaps);
    }

    async create(swap: Swap | Swap[]) {
        if (swap instanceof Array) {
            try {
                if (swap.length > 0) {
                    return await this.swapRepository.insertMany(swap, { ordered: false } as any);
                }
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving swaps: ${error}`);
                }
            }
        } else {
            try {
                const result = await this.swapRepository.save(swap);
                Emitter.Instance.emit('WS_MESSAGE', { topic: 'Swap', data: swap });
                return result;
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving swaps: ${error}`);
                }
            }
        }
    }

    async updateMany(data: any[], status: number) {
        try {
            const query = data.reduce((p: ObjectLiteral[], c) => {
                if (c.transactionHash) {
                    p.push({
                        updateOne: {
                            filter: { id: c.id },
                            update: { $set: { status, completenessTransactionHash: c.transactionHash } },
                        },
                    });
                } else {
                    p.push({
                        updateOne: {
                            filter: { id: c.id },
                            update: { $set: { status } },
                        },
                    });
                }

                return p;
            }, [] as any);

            if (query.length > 0) {
                return await this.swapRepository.bulkWrite(query, { ordered: false });
            }
        } catch (error) {
            Log.error(`Error while updating many swaps: ${error}`);
        }
    }

    async updateOne(id: string, status: number, txHash: string) {
        try {
            const result = await this.swapRepository.updateOne(
                { id },
                { $set: { status, completenessTransactionHash: txHash } }
            );

            Emitter.Instance.emit('WS_MESSAGE', {
                topic: 'Update',
                data: { id, status, completenessTransactionHash: txHash },
            });

            return result;
        } catch (error) {
            Log.error(`Error while updating the swap: ${error}`);
        }
    }

    getInputSwaps(inputSwaps: Swap[], outputSwaps: Swap[]) {
        return inputSwaps.reduce((result, swap) => {
            const outputSwap = outputSwaps.find(
                (outputSwap) =>
                    cmpIgnoreCase(outputSwap.hashLock, swap.hashLock) &&
                    cmpIgnoreCase(outputSwap.network, swap.outputNetwork)
            );

            if (outputSwap) {
                result.push({ ...swap, outputSwap });
            } else {
                result.push(swap);
            }

            return result;
        }, [] as any);
    }
}
