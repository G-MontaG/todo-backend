import express = require('express');
import { BaseController } from '../../base.controller';

class TestController extends BaseController {
    public handler() {
        this.res.status(200).send({ message: 'Test works!' });
    }
}

export function testHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    const testController = new TestController();
    testController.setHandlerParams(req, res, next);
    testController.handler();
}
