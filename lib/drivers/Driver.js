class Driver {

    _parse(value) {
        return JSON.parse(value);
    }

    _stringify(value) {
        return JSON.stringify(value);
    }

    get(key) {
        throw new Error('No implemented yet');
    }

    set(key, value) {
        throw new Error('No implemented yet');
    }
}

module.exports = Driver;