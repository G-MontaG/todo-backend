import fs = require('fs');
import path = require('path');

import express = require('express');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import compress = require('compression');
import cors = require('cors');
import helmet = require('helmet');

import winston = require('winston');

// import multer = require('multer');
// const upload = multer({dest: path.join(__dirname, '../uploads')});

import './db';
import { testRouter } from './controllers/test/test.router';
// import { authRouter } from './controllers/auth/auth.router';

const publicDir = path.join(__dirname, 'public');

class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.set('port', process.env.SERVER_PORT || 3000);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(compress(6));
        this.app.use(helmet());
        this.app.use(cors());

        this.app.use(express.static(publicDir));

        this.configureRoutes();
        this.configureErrorHandler();

        this.app.listen(this.app.get('port'), () => {
            winston.log('info', `Server listening on port ${this.app.get('port')} in ${this.app.get('env')} mode`);
        });
    }

    private addNamespace(namespace: string, router) {
        this.app.use(namespace, router);
    }

    private configureRoutes() {
        this.addNamespace('/api', testRouter.routes);
        // this.addNamespace('/api', apiRouter.routes);
    }

    private configureErrorHandler() {
        if (process.env.NODE_ENV === 'production') {
            // Raven.config(
            //    'https://256c017ff80b49059d7e3e67c562ea8a:4220dacbc2c0425aa3f836b802631467@sentry.io/189328'
            // ).install();
            // this.app.use(Raven.requestHandler());
            // this.app.use(Raven.errorHandler());
        }

        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            winston.log('error', `${req.method} ${req.path} [${err.status}] - ${err.message}`);
            winston.log('error', err.stack);
            res.status(err.status || 500).send({
                message: err.message || err.name,
                error: err.toString()
            });
        });
    }
}

const server = new Server();
