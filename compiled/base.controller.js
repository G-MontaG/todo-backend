"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Boom = require("boom");
const Joi = require("joi");
class BaseController {
    setHandlerParams(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }
    validate(data) {
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
    errorHandler(err) {
        if (!err.statusCode || !err.payload) {
            this.next(err);
        }
        this.res.status(err.statusCode).send(err.payload);
    }
}
exports.BaseController = BaseController;
