import { Request, Response, NextFunction } from 'express';
import WithdrawService from './service';

export default class WithdrawController {
    private withdrawService: WithdrawService;

    constructor() {
        this.withdrawService = new WithdrawService();
    }

    getBySenderAfter(request: Request, response: Response, next: NextFunction) {
        const { address, expiration } = request.params;
        return this.withdrawService.getBySenderAfter(address, expiration);
    }
}
