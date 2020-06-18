import { getMongoRepository } from 'typeorm';

import Refund from './entity';

import Log from '../../logger';

export default class RefundRepository {
    private refundRepository = getMongoRepository(Refund);

    public async create(refund: Refund | Refund[]) {
        if (refund instanceof Array) {
            try {
                if (refund.length > 0) {
                    return await this.refundRepository.insertMany(refund, { ordered: false } as any);
                }
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving refunds: ${error}`);
                }
            }
        } else {
            try {
                return await this.refundRepository.save(refund);
            } catch (error) {
                if (error?.code !== 11000) {
                    Log.error(`Error while bulk saving refunds: ${error}`);
                }
            }
        }
    }
}
