import { Request, Response, NextFunction } from 'express';
import WithdrawService from './service';

export default class WithdrawController {
    private withdrawService: WithdrawService;

    constructor() {
        this.withdrawService = new WithdrawService();
    }

    getAll(request: Request, response: Response, next: NextFunction) {
        return this.withdrawService.get();
    }
}
