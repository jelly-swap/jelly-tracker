import SwapRepository from './repository';
import Swap from './entity';
import Refund from '../refund/entity';
import Withdraw from '../withdraw/entity';
import { matchSwaps, matchSwapsBySender } from '../../utils/common';

export default class SwapService {
    private swapRepository = new SwapRepository();

    async getAll() {
        const result = await this.swapRepository.getAll();
        return matchSwaps(result);
    }

    async getByAddress(address: string) {
        const result = await this.swapRepository.getByAddress(address);
        return matchSwapsBySender(result, address);
    }

    async getByAddressAfter(address: string, timestamp: string) {
        const result = await this.swapRepository.getByAddressAfter(address, timestamp);
        return matchSwapsBySender(result, address);
    }

    async getByStatus(status: number) {
        const result = await this.swapRepository.getByStatus(status);
        return matchSwaps(result);
    }

    async getByAddressAndStatus(address: string, status: number) {
        const result = await this.swapRepository.getByAddressAndStatus(address, status);
        return matchSwaps(result);
    }

    async create(swap: Swap | Swap[]) {
        return await this.swapRepository.create(swap);
    }

    async onRefund(refund: Refund | Refund[]) {
        if (refund instanceof Array) {
            const ids = refund.reduce((p, c) => {
                p.push(c.id);
                return p;
            }, [] as any);
            return await this.swapRepository.updateMany(ids, 2);
        } else {
            return await this.swapRepository.updateOne(refund.id, 2);
        }
    }

    async onWithdraw(withdraw: Withdraw | Withdraw[]) {
        if (withdraw instanceof Array) {
            const ids = withdraw.reduce((p, c) => {
                p.push(c.id);
                return p;
            }, [] as any);
            return await this.swapRepository.updateMany(ids, 3);
        } else {
            return await this.swapRepository.updateOne(withdraw.id, 3);
        }
    }
}
