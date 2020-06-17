import env from '../env';

import Entities from './entities';

export default {
    type: env.db.type,
    url: env.db.url,
    synchronize: env.db.synchronize,
    authSource: env.db.authSource,
    entities: Entities,
    logging: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
