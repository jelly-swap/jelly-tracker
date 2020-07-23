import SwapController from './controller';

export default [
    {
        method: 'get',
        route: '/api/v1/swaps/all',
        controller: SwapController,
        action: 'getAll',
    },

    {
        method: 'get',
        route: '/api/v1/swaps/address/:address',
        controller: SwapController,
        action: 'getByAddress',
    },

    {
        method: 'get',
        route: '/api/v1/swaps/address/:address/expiration/:expiration',
        controller: SwapController,
        action: 'getByAddressAfter',
    },

    {
        method: 'get',
        route: '/api/v1/swaps/receiver/:address/expiration/:expiration',
        controller: SwapController,
        action: 'getByReceiverAfter',
    },

    {
        method: 'get',
        route: '/api/v1/swaps/status/:status',
        controller: SwapController,
        action: 'getByStatus',
    },

    {
        method: 'get',
        route: '/api/v1/swaps/address/:address/status/:status',
        controller: SwapController,
        action: 'getByAddressAndStatus',
    },
];
