import { Request, Response, NextFunction } from 'express';
import WithdrawService from './service';

export default class WithdrawController {
    private withdrawService: WithdrawService;

    constructor() {
        this.withdrawService = new WithdrawService();
    }

    getByAddressAfter(request: Request, response: Response, next: NextFunction) {
        const { address, expiration } = request.params;
        return this.withdrawService.getByAddressAfter(address, expiration);
    }
}
