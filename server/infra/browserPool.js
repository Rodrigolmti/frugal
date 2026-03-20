const genericPool = require('generic-pool');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getProxyArgs } = require('./stealth');

puppeteer.use(StealthPlugin());

let pool = null;

function getPool() {
  if (pool) return pool;

  const factory = {
    create: async () => {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--memory-pressure-off',
          ...getProxyArgs(),
        ],
        timeout: 30000,
      });
      return browser;
    },
    destroy: async (browser) => {
      try { await browser.close(); } catch {}
    },
    validate: async (browser) => {
      try {
        return browser.isConnected();
      } catch {
        return false;
      }
    },
  };

  pool = genericPool.createPool(factory, {
    min: 0,
    max: 4,
    idleTimeoutMillis: 60000,
    acquireTimeoutMillis: 30000,
    testOnBorrow: true,
  });

  return pool;
}

async function acquire() {
  return getPool().acquire();
}

async function release(browser) {
  try {
    const pages = await browser.pages();
    await Promise.all(pages.slice(1).map(p => p.close().catch(() => {})));
  } catch {}
  try {
    getPool().release(browser);
  } catch {}
}

async function shutdown() {
  if (!pool) return;
  await pool.drain();
  await pool.clear();
  pool = null;
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { acquire, release, shutdown };
