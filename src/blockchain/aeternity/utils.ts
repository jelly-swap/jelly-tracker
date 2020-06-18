import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 100, POW_PRECISION: 100 });

const FUNCTIONS = {
    '7c7095895733e8f0237b537a14ed87e0417372c3baa08c0226a15beed44332c9': 'new_swap',
    c697685b94066657fe65070d9b29384389e827776cd5f0e2270252cfb7e9cf14: 'withdraw',
    c4e6ebe500e9327588e3eb820645ed28c99741f75e762e01faada721269ebab5: 'refund',
};

export const getFunctionName = (tx: any): any => {
    const log = tx.log;

    if (log.length >= 1) {
        const topic = new BigNumber(log[0].topics[0]).toString(16);
        return FUNCTIONS[topic];
    }
};

export const getRefund = (log: any) => {
    return {
        id: pad64WithPrefix(log[0]),
        sender: 'ak_' + log[1],
        receiver: 'ak_' + log[2],
        hashLock: pad64WithPrefix(log[3]),
    };
};

export const getWithdraw = (log: any) => {
    const splitData = log[3].split(',');

    return {
        id: pad64WithPrefix(log[0]),
        sender: 'ak_' + log[1],
        receiver: 'ak_' + log[2],
        secret: pad64WithPrefix(splitData[0]),
        hashLock: pad64WithPrefix(splitData[1]),
    };
};

export const getNewSwap = (log: any) => {
    const splitData = log[3].split(',');

    return {
        id: pad64WithPrefix(log[0]),
        sender: 'ak_' + log[1],
        receiver: 'ak_' + log[2],
        outputNetwork: splitData[0],
        outputAddress: splitData[1],
        inputAmount: splitData[2],
        outputAmount: splitData[3],
        expiration: splitData[4],
        hashLock: pad64WithPrefix(splitData[5]),
    };
};

const pad64 = (val: string) => {
    return val.toLowerCase().padStart(64, '0');
};

const pad64WithPrefix = (val: string) => {
    return '0x' + pad64(val);
};
