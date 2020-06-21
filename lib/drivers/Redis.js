const redis = require("redis");

const Driver = require('./Driver');

class RedisDriver extends Driver {
    constructor(options) {
        super();

        if (!!RedisDriver.instance) {
            return RedisDriver.instance;
        }

        RedisDriver.instance = this;
    
        console.log('Using', options, 'for redis connection');

        this.client = redis.createClient(options);

        this.client.on("error", (error) => {
            console.log('Error in redis connection', error);
        });

        this.client.on("ready", () => {
            console.log('Connected to redis');
        });

        return this;
    }

    get(key) {
        return new Promise((resolve) => {
            this.client.get(key, (err, reply) => {
                if (err) {
                    console.log('Error getting value from redis', err);
                    return resolve(null);
                }
                
                resolve(this._parse(reply));
            });
        });
    }

    set(key, value, config) {
        return new Promise((resolve) => {
            this.client.set(key, this._stringify(value), (err) => {
                if (err) {
                    console.log('Error setting value in redis', err);
                }

                this.client.expire(key, config.maxAge, (expireErr) => {
                    if (expireErr) {
                        console.log('Error setting expire time for', key);
                    } else {
                        console.log('The cache for', key, 'will expire in', config.maxAge, 'seconds');
                    }

                    resolve(value);
                });
            });
        });
    }
}

module.exports = RedisDriver;