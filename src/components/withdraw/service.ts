import WithdrawRepository from './repository';
import Withdraw from './entity';

export default class WithdrawService {
    private withdrawRepository = new WithdrawRepository();

    async create(withdraw: Withdraw | Withdraw[]) {
        return await this.withdrawRepository.create(withdraw);
    }
}
