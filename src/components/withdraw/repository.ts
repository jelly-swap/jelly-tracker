import { getMongoRepository } from 'typeorm';

import Withdraw from './entity';

import Log from '../../logger';

export default class WithdrawRepository {
    private withdrawRepository = getMongoRepository(Withdraw);

    public async create(withdraw: Withdraw | Withdraw[]) {
        if (withdraw instanceof Array) {
            const withdraws = withdraw.reduce((p, c) => {
                p.push({ insertOne: { ...c } });
                return p;
            }, [] as any);

            try {
                return await this.withdrawRepository.bulkWrite(withdraws, { ordered: false });
            } catch (error) {
                Log.error(`Error while bulk saving withdraws: ${error}`);
            }
        } else {
            try {
                return await this.withdrawRepository.save(withdraw);
            } catch (error) {
                Log.error(`Error while saving the Withdraw: ${error}`);
            }
        }
    }
}
