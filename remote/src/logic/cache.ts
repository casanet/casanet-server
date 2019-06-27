import * as NodeCache from 'node-cache';

/**
 * Cache utility. wrap cache API to replace cache tool with redis client easily.
 */
export class Cache {
  private _nodeCache: NodeCache;

  /**
   * Init Cache.
   * @param ttl Time duration in seconds to hold value in cache.
   * @param checkperiod Automatic delete check interval duration in seconds.
   */
  constructor(ttl: number, checkperiod: number = 0) {
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
  public async get(key: string | number): Promise<any> {
    return this._nodeCache.get(key);
  }

  /**
   * Save or set value map by key to cache.
   * @param key The key to mapping by.
   * @param value The value to store.
   */
  public async set(key: string | number, value: any): Promise<void> {
    this._nodeCache.set(key, value);
  }
}
