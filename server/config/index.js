require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  debugScraping: process.env.DEBUG_SCRAPING === 'true',

  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },

  scraping: {
    timeout: 30000,
    maxConcurrentStores: 6,
  },

  browserPool: {
    min: 0,
    max: 4,
    idleTimeoutMs: 60000,
    acquireTimeoutMs: 30000,
  },

  cache: {
    maxEntries: 200,
    defaultTtlMs: 5 * 60 * 1000,
  },

  circuitBreaker: {
    failureThreshold: 3,
    cooldownMs: 60000,
  },
};

module.exports = config;
