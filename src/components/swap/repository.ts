import {
    getMongoRepository,
    MongoRepository,
    UpdateEvent,
    ObjectLiteral,
    ReplaceOneOptions,
    UpdateWriteOpResult,
    getCustomRepository,
    EntityRepository,
} from 'typeorm';

import Swap from './entity';

import Log from '../../logger';
import { time } from 'console';

export default class SwapRepository {
    private swapRepository = getCustomRepository(CustomSwapRepository);

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
                $and: [
                    { $or: [{ receiver: address }, { sender: address }] },
                    { expiration: { $gte: Number(timestamp) } },
                ],
            },
        });
    }

    async getByAddressesAfter(addresses: string[], timestamp: string) {
        return await this.swapRepository.find({
            where: {
                $and: [
                    { $or: [{ receiver: { $in: addresses } }, { sender: { $in: addresses } }] },
                    { expiration: { $gte: Number(timestamp) } },
                ],
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
                return await this.swapRepository.save(swap);
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving swaps: ${error}`);
                }
            }
        }
    }

    async updateMany(ids: string[], status: number) {
        try {
            return await this.swapRepository.updateMany(
                {
                    id: { $in: ids },
                },
                { $set: { status } }
            );
        } catch (error) {
            Log.error(`Error while updating many swaps: ${error}`);
        }
    }

    async updateOne(id: string, status: number) {
        try {
            console.log(id, status);
            const result = await this.swapRepository.updateOne({ id }, { $set: { status } });
            return result;
        } catch (error) {
            Log.error(`Error while updating the swap: ${error}`);
        }
    }
}

@EntityRepository(Swap)
export class CustomSwapRepository extends MongoRepository<Swap> {
    async updateOne(
        query: ObjectLiteral,
        update: ObjectLiteral,
        options?: ReplaceOneOptions
    ): Promise<UpdateWriteOpResult> {
        const result = await super.updateOne(query, update, options);

        if (result.modifiedCount > 0) {
            this.manager.connection.subscribers.forEach((subscriber) =>
                subscriber.afterUpdate({ ...update['$set'], ...query } as any)
            );
        }

        return result;
    }
}
