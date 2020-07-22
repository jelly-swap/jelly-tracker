import WithdrawController from './controller';

export default [
    {
        method: 'post',
        route: '/',
        controller: WithdrawController,
        action: '',
    },
    {
        method: 'get',
        route: '/withdraws',
        controller: WithdrawController,
        action: 'getAll',
    },
];
