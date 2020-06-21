const Driver = require('./Driver');

class MemoryDriver extends Driver {
    constructor() {
        super();

        if (!!MemoryDriver.instance) {
            return MemoryDriver.instance;
        }

        MemoryDriver.instance = this;
    
        this.client = {};
    
        return this;
    }

    get(key) {
        return Promise.resolve(this._parse(this.client[key]));
    }

    set(key, value) {
        this.client[key] = this._stringify(value);
        return this.get(key);
    }
}

module.exports = MemoryDriver;