import BlockRepository from './repository';

export default class BlockService {
    private blockRepository = new BlockRepository();

    async update(network: string, block: number) {
        return await this.blockRepository.update(network, block);
    }

    async getBlockNumber(network: string) {
        return await this.blockRepository.getBlockNumber(network);
    }
}
