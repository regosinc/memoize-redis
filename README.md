# promise-memoize

[![NPM version](https://img.shields.io/npm/v/@regosinc/memoize-redis.svg?style=flat)](https://www.npmjs.org/package/memoize-redis)

> Memoize promise-returning functions. Includes cache expire and prefetch.

- When data expire mode enabled, new values are fetched in advance. Cache
  will be always valid, without "gaps".
  - Prefetch happens only for items in use. Inactive ones will be GC-ed as usual.
- Errors are not cached
  - You still can enable cache with separate expire time for errors, to avoid
    specific peak loads. For example, set 120s for good result and 1s on fail.


## Install

```bash
npm install promise-memoize --save
```

(\*) IE9 and below will require [setTimeout polyfill](https://developer.mozilla.org/docs/Web/API/WindowTimers/setTimeout)
for correct work.


## Usage example

```js
// Pseudo code
let db = require('mongoose').createConnection('mongodb://localhost/forum');

function lastPosts(limit) {
  return db.model('Post').find().limit(limit).orderBy('-_id').lean(true).exec(); // <- Promise
}

let cachedLastPosts = require('promise-memoize')(lastPosts, { maxAge: 60000 });

// Later...
cachedLastPosts(10).then(posts => console.log(posts));
```

## API

### promiseMemoize(fn [, options]) -> memoizedFn

Memoize function `fn`.

 - **fn(params...)** — function, returning a promise (or any "thenable").
   It can have any number of arguments, but arguments should be uniquely
   castable to strings (see below).
 - **options** — options for memoization (optional)
   - **maxAge** — an amount of milliseconds it should cache resolved
     values for (default: `600`, i.e. cache 10 minutes).
   - **maxErrorAge** — an amount of milliseconds it should cache
     rejected values for (default: `0`, i.e. don't cache).
   - **resolve** — serialiser to build unique key from `fn` arguments.
     (default: `simple`). Possible values:
     - `simple` (string) — convert each param to string & join those.
     - `json` (string) — JSON.stringify each param & join results.
     - function(Array) — custom function, with `fn` params as array on input
     - `[ String, Boolean, 'json', function ]` — array with custom functions,
       specific for each `fn` param position (text shortcuts as above are allowed).
    - driver - the storage driver that will be used to cache the results (default: `{ type: 'memory' }`). Available types:
      - `memory` (string) — the cache key/value pairs are stored in memory
      - `redis` (object) — the cache key/value pairs are stored using redis
        - options (object) — the options accepted by the redis client https://www.npmjs.com/package/redis#options-object-properties

Return value is a function with the same signature as *fn*.

**Note. How prefetch works.**

If `maxAge` used and request to cached data happens after `0.7 * maxAge` time, then:

- cached data returned
- `fn` call is executed in parallel
- cached data will be substituted with new one on success, timeouts will be extended.

So your application will not have to wait for data fetch after cache expire.


### memoizedFn(params...) -> promise

Returns result as cached promise (errors are not cached by default). If `maxAge`
used, tries to prefetch new value before expire to replace cache transparently.


### memoizedFn.clear()

Remove all cached data.


## License

[MIT](https://github.com/nodeca/promise-memoize/blob/master/LICENSE)
