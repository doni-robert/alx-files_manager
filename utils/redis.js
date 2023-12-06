/**
 * Contains the class `RedisClient`
 */

import { createClient } from 'redis';

class RedisClient {
    constructor(){
        this.client = createClient();
        this.client.on('error', (err) => console.log('Error:', err));

    }

    isAlive(){
        this.client.on('connect', (err) => {
            if (err){
                return false;
            }
            return true;
        })
    }

    async get(key){
        return await this.client.get(key);

    }

    async set(key, value, time){
        await this.client.setex(key, time, value);

    }

    async  del(key){
        await this.client.del(key);

    }
}

const redisClient = new RedisClient();

module.exports = redisClient;