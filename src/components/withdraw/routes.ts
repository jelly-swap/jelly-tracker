import WithdrawController from './controller';

export default [
    {
        method: 'get',
        route: '/api/v1/withdraws/address/:address/expiration/:expiration',
        controller: WithdrawController,
        action: 'getByAddressAfter',
    },
];
