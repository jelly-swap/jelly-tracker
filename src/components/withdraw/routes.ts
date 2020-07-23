import WithdrawController from './controller';

export default [
    {
        method: 'get',
        route: '/api/v1/withdraws/sender/:address/expiration/:expiration',
        controller: WithdrawController,
        action: 'getBySenderAfter',
    },
];
