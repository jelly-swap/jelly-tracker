import { Column, Entity, UpdateDateColumn, Index, ObjectIdColumn, ObjectID } from 'typeorm';
import { STATUS } from './constants';

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

    @Column()
    completenessTransactionHash?: string;

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
        status = STATUS.ACTIVE
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
