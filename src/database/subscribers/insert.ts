import { EventSubscriber, InsertEvent, UpdateEvent, EntitySubscriberInterface } from 'typeorm';
import Emitter from '../../websocket/emitter';

@EventSubscriber()
export class EverythingSubscriber implements EntitySubscriberInterface {
    /**
     * Called after entity insertion.
     */
    afterInsert(event: InsertEvent<any>) {
        Emitter.Instance.emit('WS_MESSAGE', { topic: event.metadata.targetName, data: event.entity });
    }

    /**
     * Called after entity insertion.
     */
    afterUpdate(event: UpdateEvent<any>) {
        Emitter.Instance.emit('WS_MESSAGE', { topic: 'Update', data: event });
    }
}
