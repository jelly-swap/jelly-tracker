import { ObjectID } from 'mongodb';
import { getMongoRepository } from 'typeorm';

import Withdraw from './entity';

import Emitter from '../../websocket/emitter';

import Log from '../../logger';

export default class WithdrawRepository {
    private withdrawRepository = getMongoRepository(Withdraw);

    public async create(withdraw: Withdraw | Withdraw[]) {
        if (withdraw instanceof Array) {
            try {
                if (withdraw.length > 0) {
                    return await this.withdrawRepository.insertMany(withdraw, { ordered: false } as any);
                }
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving withdraws: ${error}`);
                }
            }
        } else {
            try {
                const result = await this.withdrawRepository.save(withdraw);
                Emitter.Instance.emit('WS_MESSAGE', { topic: 'Withdraw', data: withdraw });
                return result;
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving withdraws: ${error}`);
                }
            }
        }
    }

    async getBySenderAfter(sender: string, timestamp: string) {
        const objectId = new ObjectID(Number(timestamp));

        const withdraws = await this.withdrawRepository.find({
            where: {
                $and: [{ sender }, { _id: { $gte: objectId } }],
            },
        });

        return withdraws;
    }

    async getBySendersAfter(senders: string[], timestamp: string) {
        const objectId = new ObjectID(Number(timestamp));

        const withdraws = await this.withdrawRepository.find({
            where: {
                $and: [{ sender: { $in: senders } }, { _id: { $gte: objectId } }],
            },
        });

        return withdraws;
    }
}
