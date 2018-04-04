"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const test_controller_1 = require("./test.controller");
class TestRouter {
    constructor() {
        this.routes = express.Router();
        this.configurations = [
            { type: 'get', route: '/test', handler: test_controller_1.testHandler }
        ];
        this.configurations.forEach((item) => {
            if (item.middleware) {
                this.routes[item.type](item.route, item.middleware, item.handler);
            }
            else {
                this.routes[item.type](item.route, item.handler);
            }
        });
    }
}
exports.testRouter = new TestRouter();
