import express = require('express');
import jwt = require('jsonwebtoken');
import winston = require('winston');
import moment = require('moment');
import { BaseController } from '../base.controller';
import { redisConnection } from '../../db/redis-connection';

class LogoutController extends BaseController {
    protected isCallByOtherRoute = false;

    constructor(req: express.Request, res: express.Response, next: express.NextFunction, isCallByOtherRoute: boolean) {
        super(req, res, next);
        this.isCallByOtherRoute = isCallByOtherRoute;
    }

    public handler() {
        this.getAuthToken()
            .then(this.findAndRemoveAuthTokenInRedis.bind(this))
            .then(this.decodeAccessToken.bind(this))
            .then(this.findTimeToExpireTokenInRedis.bind(this))
            .then(this.saveAuthTokenInRedisAsLogout.bind(this))
            .then(this.response.bind(this))
            .catch(this.errorHandler.bind(this));
    }

    protected response() {
        if (!this.isCallByOtherRoute) {
            this.res.status(200).send({ message: 'User is logout' });
        }
    }

    private getAuthToken() {
        return Promise.resolve(this.req.get('Authorization').split(' ')[1]);
    }

    private findAndRemoveAuthTokenInRedis(token: string) {
        return new Promise((resolve) => {
            redisConnection.client.get('ACCESS-TOKEN:' + token, (err: any, reply: string | null) => {
                if (err) {
                    resolve({ token, isExist: false });
                    return;
                }
                if (!reply) {
                    resolve({ token, isExist: false });
                } else {
                    const payload = JSON.parse(reply);
                    // tslint:disable-next-line:no-shadowed-variable
                    redisConnection.client.del('ACCESS-TOKEN:' + token, (err: any, reply: string | null) => {
                        if (err) {
                            winston.log('error', `${this.req.method} ${this.req.path} [RedisError]`);
                        }
                        resolve({ token, payload, isExist: true });
                    });
                }
            });
        });
    }

    private decodeAccessToken(data: { token: string, payload?: any, isExist: boolean }) {
        return new Promise((resolve, reject) => {
            if (!data.isExist) {
                const payload: any = jwt.decode(data.token);
                resolve(Object.assign({}, data, { payload }));
            } else {
                resolve(data);
            }
        });
    }

    private findTimeToExpireTokenInRedis(data: { token: string, payload: any, isExist: boolean }) {
        return Object.assign({}, data, { exp: moment.unix(data.payload.exp).diff(moment()) * 0.001 });
    }

    private saveAuthTokenInRedisAsLogout(data: { token: string, payload: any, isExist: boolean, exp: string }) {
        return new Promise((resolve) => {
            redisConnection.client.set(
                'LOGOUT-TOKEN:' + data.token,
                '',
                'EX',
                // tslint:disable-next-line:radix
                parseInt(data.exp),
                'NX',
                (err: any, reply: 'OK' | void) => {
                    if (err) {
                        winston.log('error', `${this.req.method} ${this.req.path} [RedisError]`);
                    }
                    resolve();
                });
        });
    }
}

export function logoutHandler(
    req: express.Request, res: express.Response, next: express.NextFunction, isCallByOtherRoute = false) {
    const logoutController = new LogoutController(req, res, next, isCallByOtherRoute);
    logoutController.handler();
}
