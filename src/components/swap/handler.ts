import Emitter from '../../websocket/emitter';
import SwapService from './service';

export default () => {
    const swapService = new SwapService();
    const emitter = Emitter.Instance;
    emitter.on('SWAPS', async (swaps) => {
        await swapService.create(swaps);
        emitter.emit('SWAPS_COMPLETED');
    });
};
