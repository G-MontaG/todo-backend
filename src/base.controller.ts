import express = require('express');
import jwt = require('jsonwebtoken');
import Boom = require('boom');
import Joi = require('joi');

export abstract class BaseController {
    protected req: express.Request;
    protected res: express.Response;
    protected next: express.NextFunction;

    protected schema: Joi;

    public setHandlerParams(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    public abstract handler();

    protected validate(data) {
        return Joi.validate(data, this.schema, (validationError, value) => {
            if (!validationError) {
                return null;
            }
            const error = Boom.badRequest().output;
            error.payload = {
                statusCode: error.statusCode,
                error: validationError.details,
                message: validationError.name
            };
            return error;
        });
    }

    protected errorHandler(err) {
        if (!err.statusCode || !err.payload) {
            this.next(err);
        }
        this.res.status(err.statusCode).send(err.payload);
    }
}
