"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const winston = require("winston");
// connection string format: 'mongodb://username:password@localhost:27017/test';
class MongodbConnection {
    constructor() {
        this.connectionUrlParts = [];
        this.connectionOptions = {
            server: {
                auto_reconnect: true,
                socketOptions: { keepAlive: 30000, connectTimeoutMS: 0, socketTimeoutMS: 0 }
            }
        };
        this.connectionUrlParts.push('mongodb://');
        if (process.env.MONGO_USER && process.env.MONGO__PASSWORD) {
            this.connectionUrlParts.push(process.env.MONGO_USER + ':' +
                process.env.MONGO__PASSWORD + '@');
        }
        this.connectionUrlParts.push(process.env.MONGO_HOST + ':' +
            process.env.MONGO_PORT + '/' +
            process.env.MONGO_DB_NAME);
        this.connectionUrl = this.connectionUrlParts.join('');
        this.subscribeToMongoEvents(mongoose.connection);
        mongoose.connect(this.connectionUrl, this.connectionOptions);
    }
    subscribeToMongoEvents(connection) {
        connection.on('connected', () => {
            winston.log('info', `Mongoose connected`);
        });
        connection.on('open', () => {
            winston.log('info', `Mongoose connection opened`);
        });
        connection.on('disconnecting', () => {
            winston.log('info', 'Mongoose disconnecting');
        });
        connection.on('db: disconnected', () => {
            winston.log('info', 'Mongoose disconnected');
        });
        connection.on('close', () => {
            winston.log('info', 'Mongoose connection closed');
        });
        connection.on('reconnected', () => {
            winston.log('info', 'Mongoose reconnected');
        });
        connection.on('error', (error) => {
            winston.log('error', error.message);
        });
    }
}
exports.mongodbConnection = new MongodbConnection();
