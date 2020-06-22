import {
    Column,
    Entity,
    UpdateDateColumn,
    Index,
    ObjectIdColumn,
    ObjectID,
    AfterInsert,
    BeforeInsert,
    AfterLoad,
    AfterUpdate,
    BeforeUpdate,
} from 'typeorm';

@Entity('swap')
export default class Swap {
    @ObjectIdColumn()
    public _id: ObjectID;

    @Column()
    network: string;

    @Column()
    transactionHash: string;

    @Column()
    blockNumber: number;

    @Column()
    inputAmount: string;

    @Column()
    outputAmount: string;

    @Column()
    expiration: number;

    @Column()
    @Index({ unique: true })
    id: string;

    @Column()
    hashLock: string;

    @Column()
    sender: string;

    @Column()
    receiver: string;

    @Column()
    outputNetwork: string;

    @Column()
    outputAddress: string;

    @Column()
    refundAddress: string;

    @Column()
    status: number;

    @UpdateDateColumn()
    createdAt: Date;

    constructor(
        network: string,
        transactionHash: string,
        blockNumber: number,
        inputAmount: string,
        outputAmount: string,
        expiration: number,
        id: string,
        hashLock: string,
        sender: string,
        receiver: string,
        outputNetwork: string,
        outputAddress: string,
        refundAddress = sender,
        status = ACTIVE
    ) {
        this.network = network;
        this.transactionHash = transactionHash;
        this.blockNumber = blockNumber;
        this.inputAmount = inputAmount;
        this.outputAmount = outputAmount;
        this.expiration = expiration;
        this.id = id;
        this.hashLock = hashLock;
        this.sender = sender?.toLowerCase();
        this.receiver = receiver?.toLowerCase();
        this.outputNetwork = outputNetwork;
        this.outputAddress = outputAddress?.toLowerCase();
        this.refundAddress = refundAddress?.toLowerCase();
        this.status = status;
    }
}

const INVALID = 0; // Uninitialized  swap -> can go to ACTIVE
const ACTIVE = 1; // Active swap -> can go to WITHDRAWN or EXPIRED
const REFUNDED = 2; // Swap is refunded -> final state.
const WITHDRAWN = 3; // Swap is withdrawn -> final state.
const EXPIRED = 4; // Swap is expired -> can go to REFUNDED
