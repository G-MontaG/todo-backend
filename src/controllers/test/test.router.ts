import express = require('express');
import { IRouterConfiguration } from '../../router-configuration.interface';
import { testHandler } from './test.controller';

class TestRouter {
    public routes = express.Router();
    private readonly configurations: IRouterConfiguration[] = [
        { type: 'get', route: '/test', handler: testHandler }
    ];

    constructor() {
        this.configurations.forEach((item) => {
            if (item.middleware) {
                this.routes[item.type](
                    item.route,
                    item.middleware,
                    item.handler);
            } else {
                this.routes[item.type](
                    item.route,
                    item.handler);
            }
        });
    }
}

export const testRouter = new TestRouter();
