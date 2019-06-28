"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeCache = require("node-cache");
/**
 * Cache utility. wrap cache API to replace cache tool with redis client easily.
 */
class Cache {
    /**
     * Init Cache.
     * @param ttl Time duration in seconds to hold value in cache.
     * @param checkperiod Automatic delete check interval duration in seconds.
     */
    constructor(ttl, checkperiod = 0) {
        this._nodeCache = new NodeCache({
            stdTTL: ttl,
            checkperiod: checkperiod
        });
    }
    /**
     * Get value by key.
     * @param key Key to get for.
     * @returns The value, or 'undefined' if not exist.
     */
    async get(key) {
        return this._nodeCache.get(key);
    }
    /**
     * Save or set value map by key to cache.
     * @param key The key to mapping by.
     * @param value The value to store.
     */
    async set(key, value) {
        this._nodeCache.set(key, value);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map