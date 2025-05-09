"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFromRedis = getFromRedis;
exports.saveToRedis = saveToRedis;
exports.initializeRedisConnection = initializeRedisConnection;
const ioredis_1 = __importDefault(require("ioredis"));
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;
let redisClient = null;
function initializeRedisConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!redisClient) {
            redisClient = new ioredis_1.default({
                host: 'localhost',
                port: 6379,
                db: 0,
                maxRetriesPerRequest: MAX_RETRIES,
                retryStrategy(times) {
                    if (times > MAX_RETRIES) {
                        console.error('Max redis connection retries reached. Giving up.');
                        return null;
                    }
                    const delay = Math.min(times * RETRY_BASE_DELAY, 3000);
                    console.log(`Retrying redis connection in ${delay}ms... (Attempt ${times}/${MAX_RETRIES})`);
                    return delay;
                },
                reconnectOnError(err) {
                    const targetError = 'READONLY';
                    if (err.message.includes(targetError)) {
                        return true;
                    }
                    return false;
                }
            });
            redisClient.on('connect', () => {
                console.log('Redis connected successfully');
            });
            redisClient.on('error', (err) => {
                console.error('Redis client error:', err);
            });
            redisClient.on('close', () => {
                console.log('Redis connection closed');
            });
            redisClient.on('reconnecting', (delay) => {
                console.log(`Redis client reconnecting in ${delay}ms`);
            });
            const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
            shutdownSignals.forEach(signal => {
                process.once(signal, () => __awaiter(this, void 0, void 0, function* () {
                    console.log(`Received ${signal}, initiating graceful shutdown...`);
                    yield gracefulShutdown();
                }));
            });
        }
        return redisClient;
    });
}
function saveToRedis(key, value, expirationInSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        try {
            yield redisClient.set(key, value, 'EX', expirationInSeconds);
            console.log(`Successfully saved ${key} to Redis`);
        }
        catch (err) {
            console.error('Error saving to Redis:', err);
            throw err;
        }
    });
}
function getFromRedis(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!redisClient) {
            throw new Error('Redis client not initialized');
        }
        try {
            const value = yield redisClient.get(key);
            if (value) {
                console.log(`Successfully retrieved ${key} from Redis`);
            }
            return value;
        }
        catch (err) {
            console.error('Error retrieving from Redis:', err);
            throw err;
        }
    });
}
function gracefulShutdown() {
    return __awaiter(this, void 0, void 0, function* () {
        if (redisClient) {
            try {
                console.log('Closing Redis connection...');
                yield redisClient.quit();
                console.log('Redis connection closed successfully');
            }
            catch (err) {
                console.error('Error closing Redis connection:', err);
                yield redisClient.disconnect();
            }
            finally {
                redisClient = null;
                process.exit(0);
            }
        }
    });
}
initializeRedisConnection().catch(err => {
    console.error('Failed to initialize Redis connection:', err);
    process.exit(1);
});
