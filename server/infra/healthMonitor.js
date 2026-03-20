class HealthMonitor {
  constructor() {
    this.stores = new Map();
  }

  _get(storeId) {
    if (!this.stores.has(storeId)) {
      this.stores.set(storeId, {
        lastSuccess: null,
        lastError: null,
        lastErrorMessage: null,
        consecutiveFailures: 0,
        consecutiveEmpty: 0,
        totalSearches: 0,
        totalProducts: 0,
        latencies: [],
      });
    }
    return this.stores.get(storeId);
  }

  recordSuccess(storeId, { latencyMs, productCount }) {
    const m = this._get(storeId);
    m.lastSuccess = Date.now();
    m.consecutiveFailures = 0;
    m.totalSearches++;
    m.totalProducts += productCount;
    m.latencies.push(latencyMs);
    if (m.latencies.length > 50) m.latencies.shift();

    if (productCount === 0) {
      m.consecutiveEmpty++;
    } else {
      m.consecutiveEmpty = 0;
    }
  }

  recordFailure(storeId, error) {
    const m = this._get(storeId);
    m.lastError = Date.now();
    m.lastErrorMessage = error?.message || String(error);
    m.consecutiveFailures++;
    m.totalSearches++;
  }

  getHealth(storeId) {
    const m = this._get(storeId);
    const latencies = m.latencies;
    const avgLatencyMs = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;
    const avgProductCount = m.totalSearches
      ? Math.round(m.totalProducts / m.totalSearches)
      : 0;

    return {
      lastSuccess: m.lastSuccess,
      lastError: m.lastError,
      lastErrorMessage: m.lastErrorMessage,
      consecutiveFailures: m.consecutiveFailures,
      selectorDriftWarning: m.consecutiveEmpty >= 3,
      avgLatencyMs,
      avgProductCount,
      totalSearches: m.totalSearches,
    };
  }

  getAllHealth() {
    const result = {};
    for (const [id] of this.stores) {
      result[id] = this.getHealth(id);
    }
    return result;
  }
}

module.exports = { HealthMonitor };
