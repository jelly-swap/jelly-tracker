import RefundRepository from './repository';
import Refund from './entity';

export default class WithdrawService {
    private refundRepository = new RefundRepository();

    async create(withdraw: Refund | Refund[]) {
        return await this.refundRepository.create(withdraw);
    }
}
