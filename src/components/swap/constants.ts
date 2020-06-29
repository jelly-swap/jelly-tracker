export const STATUS = {
    INVALID: 0, // Uninitialized  swap -> can go to ACTIVE
    ACTIVE: 1, // Active swap -> can go to WITHDRAWN or EXPIRED
    REFUNDED: 2, // Swap is refunded -> final state.
    WITHDRAWN: 3, // Swap is withdrawn -> final state.
    EXPIRED: 4, // Swap is expired -> can go to REFUNDED
};
