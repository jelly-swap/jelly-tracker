import Emitter from '../../websocket/emitter';
import WithdrawService from './service';
import SwapService from '../swap/service';

export default () => {
    const withdrawService = new WithdrawService();
    const swapService = new SwapService();
    Emitter.Instance.on('WITHDRAWS', async (withdraws) => {
        await withdrawService.create(withdraws);
        await swapService.onWithdraw(withdraws);
    });
};
