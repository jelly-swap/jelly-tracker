import { Column, Entity, UpdateDateColumn, Index, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity('withdraw')
export default class Withdraw {
    @ObjectIdColumn()
    public _id: ObjectID;

    @Column()
    network: string;

    @Column()
    transactionHash: string;

    @Column()
    blockNumber: number;

    @Column()
    @Index({ unique: true })
    id: string;

    @Column()
    secret: string;

    @Column()
    hashLock: string;

    @Column()
    sender: string;

    @Column()
    receiver: string;

    @UpdateDateColumn()
    createdAt: Date;

    constructor(
        network: string,
        transactionHash: string,
        blockNumber: number,
        id: string,
        secret: string,
        hashLock: string,
        sender: string,
        receiver: string
    ) {
        this.network = network;
        this.transactionHash = transactionHash;
        this.blockNumber = blockNumber;
        this.id = id;
        this.secret = secret;
        this.hashLock = hashLock;
        this.sender = sender?.toLowerCase();
        this.receiver = receiver?.toLowerCase();
    }
}
