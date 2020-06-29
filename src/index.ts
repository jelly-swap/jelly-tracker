import 'reflect-metadata';

import * as http from 'http';
import express from 'express';
import { createConnection } from 'typeorm';

import Env from './env';
import Log from './logger';

import Middleware from './middleware';

import Routes from './routes';

import { applyRoutes, applyMiddleware, startTasks } from './utils';

import dbConfig from './database/config';

import WebSocket from './websocket';

import SwapHandler from './components/swap/handler';
import WithdrawHandler from './components/withdraw/handler';
import RefundHandler from './components/refund/handler';

import Blockchain from './blockchain';
import { StatusTracker } from './components/swap/task';

createConnection(dbConfig as any)
    .then(async () => {
        const router = express();

        applyMiddleware(Middleware, router);

        applyRoutes(Routes, router);

        const server = http.createServer(router);

        new WebSocket(server).wsOn();

        server.listen(Env.app.port, () => {
            Log.info(`Server started on port ${Env.app.port}.`);
        });

        SwapHandler();
        WithdrawHandler();
        RefundHandler();

        Blockchain();

        await startTasks([new StatusTracker()]);
    })
    .catch((error) => {
        console.log(error);
        Log.error(JSON.stringify(error));
    });
