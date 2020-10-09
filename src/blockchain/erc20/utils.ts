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
              '0x4de25f080e02e8b3fdd450f0b2b9ed22c7e6cf0a': 'CAPT',
              '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
              '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa': 'TBTC',
          }
        : { '0x2d69ad895797c880abce92437788047ba0eb7ff6': 'DAI' };
