import express = require('express');
import { IRouterConfiguration } from '../router-configuration.interface';
import { checkTokenMiddleware } from '../../middlewares/check-token.middleware';
import { BaseRouter } from '../base.router';
import { signUpHandler } from './sign-up.controller';
import { loginHandler } from './login.controller';
import { verifyEmailHandler } from './verify-email.controller';
import { logoutHandler } from './logout.controller';

class AuthRouter extends BaseRouter {
    public routes = express.Router();
    protected readonly configurations: IRouterConfiguration[] = [
        {type: 'post', route: '/sign-up', handler: signUpHandler},
        {type: 'post', route: '/login', handler: loginHandler},
        {type: 'post', route: '/verify-email', middleware: [checkTokenMiddleware], handler: verifyEmailHandler},
        {type: 'get', route: '/logout', middleware: [checkTokenMiddleware], handler: logoutHandler}
    ];

    constructor() {
        super();
        this.configure();
    }
}

export const authRouter = new AuthRouter();
