import WithdrawRepository from './repository';
import Withdraw from './entity';

export default class WithdrawService {
    private withdrawRepository = new WithdrawRepository();

    async create(withdraw: Withdraw | Withdraw[]) {
        return await this.withdrawRepository.create(withdraw);
    }

    async getByAddressAfter(address: string, timestamp: string) {
        const addresses = address.split(';').map((a) => a.toLowerCase());
        const isMoreThanOneAddress = addresses.length > 1;

        if (isMoreThanOneAddress) {
            const result = await this.withdrawRepository.getByAddressesAfter(addresses, timestamp);
            return result;
        } else {
            const result = await this.withdrawRepository.getByAddressAfter(addresses[0], timestamp);
            return result;
        }
    }
}
