import { getMongoRepository } from 'typeorm';

import Refund from './entity';

import Log from '../../logger';

export default class RefundRepository {
    private refundRepository = getMongoRepository(Refund);

    public async create(refund: Refund | Refund[]) {
        if (refund instanceof Array) {
            const refunds = refund.reduce((p, c) => {
                p.push({ insertOne: { ...c } });
                return p;
            }, [] as any);

            try {
                return await this.refundRepository.bulkWrite(refunds, { ordered: false });
            } catch (error) {
                Log.error(`Error while bulk saving refunds: ${error}`);
            }
        } else {
            try {
                return await this.refundRepository.save(refund);
            } catch (error) {
                Log.error(`Error while saving the Refund: ${error}`);
            }
        }
    }
}
