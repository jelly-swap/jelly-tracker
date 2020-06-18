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

            this.eventEmiter.on('message', (msg) => {
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
