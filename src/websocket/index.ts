import * as WebSocket from 'ws';
import Emitter from './emitter';
import Log from '../logger';

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

export default class WebSocketServer {
    private wss: WebSocket.Server;
    private eventEmiter: Emitter;

    constructor(server: any) {
        this.wss = new WebSocket.Server({ server });
        this.eventEmiter = Emitter.Instance;
        this.eventEmiter.setMaxListeners(0);
    }

    wsOn() {
        this.wss.on('connection', (ws: WebSocket) => {
            const extWs = ws as ExtWebSocket;

            extWs.isAlive = true;

            ws.on('pong', () => {
                extWs.isAlive = true;
            });

            // ws.on('message', (m) => {
            //     const swap = {
            //         topic: 'Swap',
            //         data: {
            //             network: 'DAI',
            //             transactionHash: '0xaadb2d3542e7cd04fce14c2408d1ecc54a6a10a4daa488d5161d7e9df9fb3072',
            //             blockNumber: 9782196,
            //             inputAmount: '76000000000000000',
            //             outputAmount: '220377358000000000000',
            //             expiration: 1585780337,
            //             id: '0xaadb2d3542e7cd04fce14c2408d1ecc54a6a10a4daa488d5161d7e9df9fb3072',
            //             hashLock: '0x7a9bf5d047c9664c3dfc0883bf84f7cd35f68f0ddf0a91031982a72ee8a8c048',
            //             sender: '0xE009127a8ad2EC5F5072e672B08B77C9958b296e',
            //             receiver: '0x0c498d075ae2236cfd13800abc61caf04b8fad63',
            //             outputNetwork: 'ETH',
            //             outputAddress: '0x0c498d075ae2236cfd13800abc61caf04b8fad63',
            //             refundAddress: '0xE009127a8ad2EC5F5072e672B08B77C9958b296e',
            //             status: 1,
            //             _id: '5ef0e26a8858e401a88b31f7',
            //             completenessTransactionHash:
            //                 '0xf6410033bfb946a7d36d0d20bfcc84d5aa234cab16610256db57de41237b8e14',
            //         },
            //     };

            //     const update = {
            //         topic: 'Update',
            //         data: {
            //             id: '0xaadb2d3542e7cd04fce14c2408d1ecc54a6a10a4daa488d5161d7e9df9fb3071',
            //             status: 2,
            //         },
            //     };

            //     this.wss.clients.forEach((ws) => {
            //         ws.send(JSON.stringify(swap));
            //         // ws.send(JSON.stringify(update));
            //     });
            // });

            this.eventEmiter.on('WS_MESSAGE', (msg) => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify(msg));
                    Log.info(`WebSocket: ${JSON.stringify(msg)}`);
                }
            });

            ws.on('error', (err) => {
                Log.error(`Client disconnected - reason: ${err}`);
            });
        });

        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                const extWs = ws as ExtWebSocket;

                if (!extWs.isAlive) {
                    return ws.terminate();
                }

                extWs.isAlive = false;
                ws.ping(null, undefined);
            });
        }, 60000);
    }
}
