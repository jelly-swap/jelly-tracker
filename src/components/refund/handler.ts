import Emitter from '../../websocket/emitter';
import RefundService from './service';
import SwapService from '../swap/service';

export default () => {
    const refundService = new RefundService();
    const swapService = new SwapService();
    Emitter.Instance.on('REFUNDS', async (refunds) => {
        await refundService.create(refunds);
        await swapService.onRefund(refunds);
    });
};
