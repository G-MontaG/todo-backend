import express = require('express');
import Boom = require('boom');
import Joi = require('joi');
import { BaseController } from '../base.controller';
import { IUserDocument } from '../../models/user.model';
import { User } from '../../models/user.model';
import { passwordMaxLength, passwordMinLength } from '../../helpers/constants';

class SignUpController extends BaseController {
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

        User.findOne({ email: this.req.body.email }).exec()
            .then(this.checkUserExist.bind(this))
            .then(this.createUser.bind(this))
            .then(this.saveUser.bind(this))
            .then(this.sendEmailVerification.bind(this))
            .then(this.responseToken.bind(this))
            .catch(this.errorHandler.bind(this));
    }

    protected checkUserExist(user: IUserDocument) {
        if (user) {
            throw Boom.conflict('Email is already in use');
        }
        const password = this.req.body.password;
        return password;
    }

    protected async createUser(password: string) {
        const newUser = new User(this.req.body);
        newUser.createEmailVerifyToken();
        newUser.createRefreshToken();
        await newUser.cryptPassword(password);
        return newUser;
    }

    protected async saveUser(newUser: IUserDocument) {
        await newUser.save();
        return newUser;
    }

    protected sendEmailVerification(newUser: IUserDocument) {
        const mailOptions = {
            to: newUser.email,
            from: 'arthur.osipenko@gmail.com',
            subject: 'Hello on XXX',
            text: `Hello. This is a token for your account 
                   ${newUser.emailVerifyToken.value}
                   Please go back and enter it in your profile to verify your email.`
        };
        // TODO: send email
        return newUser;
    }

    protected responseToken(newUser: IUserDocument) {
        const tokenObject = this.generateAccessToken(newUser);
        this.res.status(200).send(Object.assign({},
            { message: 'User is authorized' },
            tokenObject));
    }
}

export function signUpHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    new SignUpController(req, res, next).handler();
}
