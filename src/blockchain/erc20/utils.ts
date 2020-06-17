import { pick } from '../utils';

export const getWithdraw = (log: any) => {
    return pick('id', 'secret', 'hashLock', 'tokenAddress', 'sender', 'receiver')(log);
};

export const getSwap = (log: any) => {
    return pick(
        'inputAmount',
        'outputAmount',
        'expiration',
        'id',
        'hashLock',
        'tokenAddress',
        'sender',
        'receiver',
        'outputNetwork',
        'outputAddress'
    )(log);
};

export const getRefund = (log: any) => {
    return pick('id', 'hashLock', 'tokenAddress', 'sender', 'receiver', 'tokenAddress')(log);
};

type AddressToTokenType = {
    [key: string]: string;
};

export const addressToToken = (address: string) => {
    return addressToTokenMap[address.toLowerCase()] || address.toLowerCase();
};

const addressToTokenMap: AddressToTokenType = {
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd': 'BTC++',
};
