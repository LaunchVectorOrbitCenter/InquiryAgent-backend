import { createClient, RedisClientType } from 'redis';
import { IRedisConfig } from '../configurations/redis';
import { Logger } from '../utils/helpers/logger';
import { Application } from '../app';
import EnvironmentTypes from '../core/enums/environmentTypes';



class Redis {
    private static instance: Redis | null = null;
    private client: RedisClientType | null = null;
    private config: IRedisConfig | null = null;
    private isConnected: boolean;

    /* eslint-disable @typescript-eslint/no-empty-function */
    private constructor() { }

    public static getInstance(): Redis {
        // tslint:disable:strict-boolean-expressions
        if (!Redis.instance) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    public async init(config: IRedisConfig): Promise<void> {
        this.config = config;
        if (!this.client) {
            this.client = createClient({
                url: config.url,
                socket: {
                    tls: Application.conf.ENV === EnvironmentTypes.PROD,
                    keepAlive: 5000
                }
            });

            this.client.on('error', (err) => {
                console.error('Redis Client Error', err);
                console.error('CAUSE', err.message);
            });

            this.client.on('connect', () => {
                this.isConnected = true;
                Logger.Console(`Connected to Redis: ${config.url}`, 'info');
            });

            try {
                await this.client.connect();
            } catch (err) {
                console.error('❌ Redis connection failed:', err);
            }
        }
    }

    public getClient(): RedisClientType | null {
        return this.client;
    }

    public checkConnection() {
        return this.isConnected;
    }

    public async flushAll(): Promise<void> {
        if (this.client && this.isConnected) {
            try {
                await this.client.flushAll();
                Logger.Console('Redis cache has been flushed successfully', 'info');
            } catch (error) {
                Logger.Console(`Failed to flush Redis cache: ${error.message}`, 'error');
                throw error;
            }
        } else {
            Logger.Console('Redis client is not connected', 'warn');
            throw new Error('Redis client is not connected');
        }
    }

}

export default Redis;