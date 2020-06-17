import { getMongoRepository } from 'typeorm';

import Swap from './entity';

import Log from '../../logger';
import { time } from 'console';

export default class SwapRepository {
    private swapRepository = getMongoRepository(Swap);

    async getAll() {
        return await this.swapRepository.find();
    }

    async getByAddress(address: string) {
        return await this.swapRepository.find({
            where: {
                $or: [{ receiver: address }, { sender: address }],
            },
        });
    }

    async getByAddressAfter(address: string, timestamp: string) {
        return await this.swapRepository.find({
            where: {
                $and: [{ $or: [{ receiver: address }, { sender: address }] }, { expiration: { $gte: timestamp } }],
            },
        });
    }

    async getByStatus(status: number) {
        return await this.swapRepository.find({ status });
    }

    async getByAddressAndStatus(address: string, status: number) {
        return await this.swapRepository.find({
            where: {
                $and: [{ $or: [{ receiver: address }, { sender: address }] }, { status }],
            },
        });
    }

    async create(swap: Swap | Swap[]) {
        if (swap instanceof Array) {
            const swaps = swap.reduce((p, c) => {
                p.push({ insertOne: { ...c } });
                return p;
            }, [] as any);

            try {
                return await this.swapRepository.bulkWrite(swaps, { ordered: false });
            } catch (error) {
                Log.error(`Error while bulk saving swaps: ${error}`);
            }
        } else {
            try {
                return await this.swapRepository.save(swap);
            } catch (error) {
                Log.error(`Error while saving the Swap: ${error}`);
            }
        }
    }

    async updateMany(ids: string[], status: number) {
        try {
            const query = ids.reduce((p, id) => {
                p.push({
                    updateOne: {
                        filter: { id },
                        update: { $set: { status } },
                    },
                });
                return p;
            }, [] as any);

            return await this.swapRepository.bulkWrite(query);
        } catch (error) {
            Log.error(`Error while updating many swaps: ${error}`);
        }
    }

    async updateOne(id: string, status: number) {
        try {
            return await this.swapRepository.updateOne({ id }, { status });
        } catch (error) {
            Log.error(`Error while updating the swap: ${error}`);
        }
    }
}
