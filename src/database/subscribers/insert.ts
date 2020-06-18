import { EventSubscriber, InsertEvent, UpdateEvent, EntitySubscriberInterface } from 'typeorm';

@EventSubscriber()
export class EverythingSubscriber implements EntitySubscriberInterface {
    /**
     * Called after entity insertion.
     */
    afterInsert(event: InsertEvent<any>) {
        console.log(`AFTER ENTITY INSERTED: `, event.entity);
    }

    /**
     * Called after entity insertion.
     */
    afterUpdate(event: UpdateEvent<any>) {
        console.log(`AFTER ENTITY UPDATED: `, event.entity);
    }
}
