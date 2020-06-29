export const matchSwaps = (swaps: any) => {
    return swaps.reduce((result: any[], swap: any, idx: number) => {
        const { network, hashLock } = swap;
        let hasMatch = false;

        if (!swap.matched) {
            for (let i = idx + 1; i < swaps.length; i++) {
                const nextSwap = swaps[i] as any;

                if (hashLock === nextSwap.hashLock && network === nextSwap.outputNetwork) {
                    const { matched, ...outputSwap } = nextSwap;
                    result.push({ ...swap, outputSwap });
                    hasMatch = true;
                    nextSwap.matched = true;
                    break;
                }
            }

            if (!hasMatch && !swap.matched) {
                result.push(swap);
            }
        }

        return result;
    }, []);
};

export const matchSwapsBySender = (swaps: any[], sender: string | string[]) => {
    return swaps.reduce((result: any[], swap: any, idx: number) => {
        const { network, hashLock } = swap;
        let hasMatch = false;

        if (!swap.matched) {
            for (let i = idx + 1; i < swaps.length; i++) {
                const nextSwap = swaps[i] as any;

                if (hashLock === nextSwap.hashLock && network === nextSwap.outputNetwork) {
                    const { matched, ...outputSwap } = nextSwap;
                    if (sender instanceof Array) {
                        const found = sender.some((s) => {
                            return compareAddress(swap.sender, s);
                        });

                        if (found) {
                            result.push({ ...swap, outputSwap });
                        } else {
                            result.push({ ...outputSwap, outputSwap: swap });
                        }
                    } else {
                        if (compareAddress(swap.sender, sender)) {
                            result.push({ ...swap, outputSwap });
                        } else {
                            result.push({ ...outputSwap, outputSwap: swap });
                        }
                    }

                    hasMatch = true;
                    nextSwap.matched = true;
                    break;
                }
            }

            if (!hasMatch && !swap.matched) {
                result.push(swap);
            }
        }

        return result;
    }, []);
};

export const compareAddress = (a1: string, a2: string) => a1.toLowerCase() === a2.toLowerCase();
