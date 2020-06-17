import { EventEmitter } from 'events';

export default class Emitter extends EventEmitter {
    private static instance: Emitter;

    private constructor() {
        super();
    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
