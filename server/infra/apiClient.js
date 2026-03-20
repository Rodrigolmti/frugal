const axios = require('axios');
const { getRandomHeaders } = require('./stealth');

class ApiClientError extends Error {
  constructor(message, { status, retryable = false } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.retryable = retryable;
  }
}

async function apiRequest(url, { headers = {}, timeout = 15000 } = {}) {
  const { headers: stealthHeaders } = getRandomHeaders();

  try {
    const response = await axios.get(url, {
      headers: { ...stealthHeaders, ...headers },
      timeout,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const { status } = err.response;
      const retryable = status === 429 || status >= 500;
      throw new ApiClientError(
        `API ${status}: ${err.message}`,
        { status, retryable }
      );
    }
    throw new ApiClientError(
      err.message || 'Network error',
      { retryable: true }
    );
  }
}

module.exports = { apiRequest, ApiClientError };
