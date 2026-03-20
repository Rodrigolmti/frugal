const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 60000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.circuits = new Map();
  }

  _get(storeId) {
    if (!this.circuits.has(storeId)) {
      this.circuits.set(storeId, {
        state: STATES.CLOSED,
        failures: 0,
        lastFailure: null,
        lastError: null,
      });
    }
    return this.circuits.get(storeId);
  }

  canExecute(storeId) {
    const circuit = this._get(storeId);
    if (circuit.state === STATES.CLOSED) return true;
    if (circuit.state === STATES.OPEN) {
      if (Date.now() - circuit.lastFailure >= this.cooldownMs) {
        circuit.state = STATES.HALF_OPEN;
        return true;
      }
      return false;
    }
    // HALF_OPEN: allow one probe
    return true;
  }

  recordSuccess(storeId) {
    const circuit = this._get(storeId);
    circuit.state = STATES.CLOSED;
    circuit.failures = 0;
    circuit.lastError = null;
  }

  recordFailure(storeId, error) {
    const circuit = this._get(storeId);
    circuit.failures++;
    circuit.lastFailure = Date.now();
    circuit.lastError = error?.message || String(error);

    if (circuit.state === STATES.HALF_OPEN || circuit.failures >= this.failureThreshold) {
      circuit.state = STATES.OPEN;
    }
  }

  getState(storeId) {
    const circuit = this._get(storeId);
    return {
      state: circuit.state,
      failures: circuit.failures,
      lastError: circuit.lastError,
      lastFailure: circuit.lastFailure,
    };
  }

  getAllStates() {
    const result = {};
    for (const [id, circuit] of this.circuits) {
      result[id] = {
        state: circuit.state,
        failures: circuit.failures,
        lastError: circuit.lastError,
      };
    }
    return result;
  }
}

module.exports = { CircuitBreaker, STATES };
