"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_controller_1 = require("../../base.controller");
class TestController extends base_controller_1.BaseController {
    handler() {
        this.res.status(200).send({ message: 'Test works!' });
    }
}
function testHandler(req, res, next) {
    const testController = new TestController();
    testController.setHandlerParams(req, res, next);
    testController.handler();
}
exports.testHandler = testHandler;
