import SwapRepository from './repository';
import Swap from './entity';
import Refund from '../refund/entity';
import Withdraw from '../withdraw/entity';
import { matchSwaps, matchSwapsBySender } from '../../utils/common';
import { STATUS } from './constants';

export default class SwapService {
    private swapRepository = new SwapRepository();

    async getAll() {
        const result = await this.swapRepository.getAll();
        return matchSwaps(result);
    }

    async getByAddress(address: string) {
        const result = await this.swapRepository.getByAddress(address.toLowerCase());
        return matchSwapsBySender(result, address);
    }

    async getByAddressAfter(address: string, timestamp: string) {
        const addresses = address.split(';').map((a) => a.toLowerCase());
        const isMoreThanOneAddress = addresses.length > 1;

        if (isMoreThanOneAddress) {
            const result = await this.swapRepository.getByAddressesAfter(addresses, timestamp);
            return matchSwapsBySender(result, addresses);
        } else {
            const result = await this.swapRepository.getByAddressAfter(addresses[0], timestamp);
            return matchSwapsBySender(result, addresses[0]);
        }
    }

    async getByStatus(status: number) {
        const result = await this.swapRepository.getByStatus(status);
        return matchSwaps(result);
    }

    async getByAddressAndStatus(address: string, status: number) {
        const result = await this.swapRepository.getByAddressAndStatus(address.toLowerCase(), status);
        return matchSwaps(result);
    }

    async create(swap: Swap | Swap[]) {
        return await this.swapRepository.create(swap);
    }

    async onRefund(refund: Refund | Refund[]) {
        if (refund instanceof Array) {
            return await this.swapRepository.updateMany(refund, STATUS.REFUNDED);
        } else {
            return await this.swapRepository.updateOne(refund.id, STATUS.REFUNDED, refund.transactionHash);
        }
    }

    async onWithdraw(withdraw: Withdraw | Withdraw[]) {
        if (withdraw instanceof Array) {
            return await this.swapRepository.updateMany(withdraw, STATUS.WITHDRAWN);
        } else {
            return await this.swapRepository.updateOne(withdraw.id, STATUS.WITHDRAWN, withdraw.transactionHash);
        }
    }
}
