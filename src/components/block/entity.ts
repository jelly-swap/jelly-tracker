import { Column, Index, Entity, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity('block')
export default class Block {
    @ObjectIdColumn()
    public id: ObjectID;

    @Column()
    @Index({ unique: true })
    network: string;

    @Column()
    block: number;

    constructor(network: string, block: number) {
        this.block = block;
        this.network = network;
    }
}
