import { pick } from '../utils';

export const getWithdraw = (log: any) => {
    return pick('id', 'secret', 'hashLock', 'sender', 'receiver')(log);
};

export const getSwap = (log: any) => {
    return pick(
        'inputAmount',
        'outputAmount',
        'expiration',
        'id',
        'hashLock',
        'sender',
        'receiver',
        'outputNetwork',
        'outputAddress'
    )(log);
};

export const getRefund = (log: any) => {
    return pick('id', 'hashLock', 'sender', 'receiver')(log);
};
