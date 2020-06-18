import { getMongoRepository } from 'typeorm';
import Block from './entity';

import Log from '../../logger';

export default class BlockRepository {
    private blockRepository = getMongoRepository(Block);

    public async update(network: string, block: number) {
        try {
            return await this.blockRepository.findOneAndUpdate(
                { network },
                {
                    $set: {
                        block,
                    },
                },
                { upsert: true }
            );
        } catch (error) {
            Log.error(`Error while updating the ${network} block: ${error}`);
        }
    }

    public async getBlockNumber(network: string) {
        const result = await this.blockRepository.findOne({ network });
        return result && result.block;
    }
}
