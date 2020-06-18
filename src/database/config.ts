import env from '../env';

import Entities from './entities';
import Subscribers from './subscribers';

export default {
    type: env.db.type,
    url: env.db.url,
    synchronize: env.db.synchronize,
    authSource: env.db.authSource,
    entities: Entities,
    subscribers: Subscribers,
    logging: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
