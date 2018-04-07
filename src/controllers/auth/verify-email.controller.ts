import express = require('express');
import Boom from 'boom';
import Joi = require('joi');
import { BaseController } from '../base.controller';
import { IUserDocument } from '../../models/user.model';
import { IRequestWithUserId } from '../request.interface';
import { User } from '../../models/user.model';
import { emailConfirmTokenLength } from '../../helpers/constants';

class VerifyEmailController extends BaseController {
    protected readonly req: IRequestWithUserId;

    protected readonly schema = Joi.object().keys({
        token: Joi.string().length(emailConfirmTokenLength)
    }).requiredKeys(['token']);

    public handler() {
        const result = this.validate(this.req.body);
        if (result) {
            this.errorHandler(result);
            return;
        }

        User.findById(this.req.userId).exec()
            .then(this.checkToken.bind(this))
            .then(this.response.bind(this))
            .catch(this.errorHandler.bind(this));
    }

    protected async checkToken(user: IUserDocument) {
        const token = this.req.body.token;
        if (!user) {
            throw Boom.unauthorized('User not found');
        }
        if (user.emailConfirmed) {
            return;
        }
        if (user.isEmailVerifyTokenExpired()) {
            throw Boom.badRequest('Token expired');
        }
        if (!user.isEmailVerifyTokenEqual(token)) {
            throw Boom.badRequest('Token is wrong');
        }
        user.setEmailConfirmed();
        await user.save();
    }

    protected response() {
        this.res.status(200).send({message: 'Email is confirmed'});
    }
}

export function verifyEmailHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    new VerifyEmailController(req, res, next).handler();
}
