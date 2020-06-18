import { EventEmitter } from 'events';

export default class Emitter extends EventEmitter {
    private static instance: Emitter;

    private constructor() {
        super();
    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    async emitAsync(event: string | symbol, ...args: any[]): Promise<boolean> {
        const listeners = this.listeners(event);

        for (const l of listeners) {
            await l(...args);
        }

        return true;
    }
}
