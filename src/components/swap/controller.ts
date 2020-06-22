import { NextFunction, Request, Response } from 'express';

import SwapService from './service';

export default class SwapController {
    private swapService: SwapService;

    constructor() {
        this.swapService = new SwapService();
    }

    getAll() {
        return this.swapService.getAll();
    }

    getByAddress(request: Request, response: Response, next: NextFunction) {
        const { address } = request.params;
        return this.swapService.getByAddress(address);
    }

    getByAddressAfter(request: Request, response: Response, next: NextFunction) {
        const { address, expiration } = request.params;
        return this.swapService.getByAddressAfter(address, expiration);
    }

    getByStatus(request: Request, response: Response, next: NextFunction) {
        const { status } = request.params;
        return this.swapService.getByStatus(Number(status));
    }

    getByAddressAndStatus(request: Request, response: Response, next: NextFunction) {
        const { address, status } = request.params;
        return this.swapService.getByAddressAndStatus(address, Number(status));
    }
}
