const RETRYABLE_PATTERNS = [
  'timeout', 'navigation', 'net::ERR', 'ECONNRESET', 'ECONNREFUSED',
  'empty results', 'rate limit', '429', 'socket hang up',
];

function isRetryable(err) {
  const msg = (err.message || '').toLowerCase();
  return RETRYABLE_PATTERNS.some(p => msg.includes(p.toLowerCase()));
}

async function withRetry(fn, opts = {}) {
  const { maxAttempts = 3, backoffMs = [1000, 3000], jitter = true } = opts;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts || !isRetryable(err)) throw err;

      let delay = backoffMs[Math.min(attempt - 1, backoffMs.length - 1)];
      if (jitter) delay += Math.floor(Math.random() * delay * 0.3);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

module.exports = { withRetry, isRetryable };
