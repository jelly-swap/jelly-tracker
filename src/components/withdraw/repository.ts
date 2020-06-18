import { getMongoRepository } from 'typeorm';

import Withdraw from './entity';

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
                return await this.withdrawRepository.save(withdraw);
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving withdraws: ${error}`);
                }
            }
        }
    }
}
