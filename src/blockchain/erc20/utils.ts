import { pick } from '../utils';
import Env from '../../env';

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

const addressToTokenMap: AddressToTokenType =
    Env.blockchain.erc20.chain === 'homestead'
        ? {
              '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC',
              '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
              '0x03a5d1d4c764decf50ae12decbed8a51a421faa0': 'CAPT',
              '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
              '0x8daebade922df735c38c80c7ebd708af50815faa': 'TBTC',
          }
        : { '0x2d69ad895797c880abce92437788047ba0eb7ff6': 'DAI' };
