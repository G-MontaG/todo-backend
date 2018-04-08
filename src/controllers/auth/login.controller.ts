import express = require('express');
import Boom = require('boom');
import Joi = require('joi');
import { BaseController } from '../base.controller';
import { IUserDocument } from '../../models/user.model';
import { User } from '../../models/user.model';
import { passwordMaxLength, passwordMinLength } from '../../helpers/constants';

class LoginController extends BaseController {
    protected readonly schema = Joi.object().keys({
        email: Joi.string().email(),
        password: Joi.string().regex(new RegExp(`^[a-zA-Z0-9]{${passwordMinLength},${passwordMaxLength}}$`))
    }).requiredKeys(['email', 'password']);

    public handler() {
        const result = this.validate(this.req.body);
        if (result) {
            this.errorHandler(result);
            return;
        }

        User.findOne({email: this.req.body.email}).exec()
            .then(this.checkUserExist.bind(this))
            .then(this.checkPassword.bind(this))
            .then(this.verifyResult.bind(this))
            .then(this.responseToken.bind(this))
            .catch(this.errorHandler.bind(this));
    }

    protected checkUserExist(user: IUserDocument) {
        if (!user) {
            throw Boom.unauthorized('Email not found');
        }
        const password = this.req.body.password;
        return {user, password};
    }

    protected async checkPassword(params: {user: IUserDocument, password: string}) {
        const result = await params.user.checkPassword(params.password);
        return {user: params.user, result};
    }

    protected verifyResult(params: {user: IUserDocument, result: any}) {
        if (!params.result) {
            throw Boom.unauthorized('Incorrect password');
        }
        return {user: params.user};
    }

    protected responseToken(params: {user: IUserDocument}) {
        const tokenObject = this.generateAccessToken(params.user);
        this.res.status(200).send(Object.assign({},
            {message: 'User is authorized'},
            tokenObject));
    }
}

export function loginHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    new LoginController(req, res, next).handler();
}
