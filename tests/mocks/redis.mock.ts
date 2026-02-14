/**
 * In-memory Redis mock for testing
 * Simulates Redis operations without requiring a real Redis server
 */

interface RedisItem {
  value: string;
  expiry?: number;
}

class RedisMock {
  private store: Map<string, RedisItem> = new Map();

  /**
   * Get value from Redis
   * @param key - Redis key
   * @returns Value or null if not found/expired
   */
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in Redis
   * @param key - Redis key
   * @param value - Value to store
   * @param options - Options including EX (expiry in seconds)
   * @returns OK on success
   */
  async set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number }
  ): Promise<'OK'> {
    let expiry: number | undefined;

    if (options?.EX) {
      expiry = Date.now() + options.EX * 1000;
    } else if (options?.PX) {
      expiry = Date.now() + options.PX;
    }

    this.store.set(key, { value, expiry });
    return 'OK';
  }

  /**
   * Set value with expiry in seconds
   * @param key - Redis key
   * @param seconds - Expiry in seconds
   * @param value - Value to store
   * @returns OK on success
   */
  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    return this.set(key, value, { EX: seconds });
  }

  /**
   * Delete key from Redis
   * @param key - Redis key
   * @returns Number of keys deleted
   */
  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    keys.forEach((key) => {
      if (this.store.delete(key)) {
        deleted++;
      }
    });
    return deleted;
  }

  /**
   * Check if key exists
   * @param key - Redis key
   * @returns 1 if exists, 0 if not
   */
  async exists(key: string): Promise<number> {
    const item = this.store.get(key);

    if (!item) {
      return 0;
    }

    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return 0;
    }

    return 1;
  }

  /**
   * Set expiry on existing key
   * @param key - Redis key
   * @param seconds - Expiry in seconds
   * @returns 1 if expiry set, 0 if key not found
   */
  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);

    if (!item) {
      return 0;
    }

    item.expiry = Date.now() + seconds * 1000;
    this.store.set(key, item);
    return 1;
  }

  /**
   * Get time to live for key
   * @param key - Redis key
   * @returns TTL in seconds or -1 if no expiry, -2 if not found
   */
  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);

    if (!item) {
      return -2;
    }

    if (!item.expiry) {
      return -1;
    }

    const ttl = Math.ceil((item.expiry - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  /**
   * Get all keys matching pattern
   * @param pattern - Key pattern (simplified, only supports * wildcard)
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const keys: string[] = [];

    this.store.forEach((_, key) => {
      if (regex.test(key)) {
        keys.push(key);
      }
    });

    return keys;
  }

  /**
   * Increment value
   * @param key - Redis key
   * @returns New value after increment
   */
  async incr(key: string): Promise<number> {
    const item = this.store.get(key);
    const currentValue = item ? parseInt(item.value, 10) || 0 : 0;
    const newValue = currentValue + 1;

    await this.set(key, newValue.toString());
    return newValue;
  }

  /**
   * Decrement value
   * @param key - Redis key
   * @returns New value after decrement
   */
  async decr(key: string): Promise<number> {
    const item = this.store.get(key);
    const currentValue = item ? parseInt(item.value, 10) || 0 : 0;
    const newValue = currentValue - 1;

    await this.set(key, newValue.toString());
    return newValue;
  }

  /**
   * Clear all keys from store
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get number of keys in store
   * @returns Number of keys
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Flush all keys (alias for clear)
   */
  async flushall(): Promise<'OK'> {
    this.clear();
    return 'OK';
  }

  /**
   * Flush current database (alias for clear)
   */
  async flushdb(): Promise<'OK'> {
    this.clear();
    return 'OK';
  }
}

// Create singleton instance
export const redisMock = new RedisMock();

// Export mock client
export const createRedisMock = () => redisMock;

// Reset function for tests
export const resetRedisMock = () => {
  redisMock.clear();
};

export default redisMock;
