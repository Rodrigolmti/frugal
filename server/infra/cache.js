class Cache {
  constructor({ maxEntries = 200, defaultTtlMs = 5 * 60 * 1000 } = {}) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
  }

  _makeKey(storeId, searchTerm) {
    return `${storeId}:${searchTerm.toLowerCase().trim()}`;
  }

  get(storeId, searchTerm) {
    const key = this._makeKey(storeId, searchTerm);
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    // LRU: move to end
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(storeId, searchTerm, value, ttlMs) {
    const key = this._makeKey(storeId, searchTerm);
    // Evict oldest if at capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs),
    });
  }

  invalidate(storeId, searchTerm) {
    this.store.delete(this._makeKey(storeId, searchTerm));
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

module.exports = { Cache };
