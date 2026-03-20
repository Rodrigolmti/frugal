const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

const ACCEPT_LANGUAGES = [
  'en-US,en;q=0.9',
  'en-CA,en;q=0.9,fr-CA;q=0.8',
  'en-US,en;q=0.9,fr;q=0.8',
  'en-GB,en;q=0.9,en-US;q=0.8',
  'en-CA,en-US;q=0.9,en;q=0.8',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay(min, max) {
  return new Promise(resolve => setTimeout(resolve, randomInt(min, max)));
}

function getRandomUserAgent() {
  return randomItem(USER_AGENTS);
}

function getRandomViewport() {
  return {
    width: randomInt(1366, 1920),
    height: randomInt(768, 1080),
  };
}

function getRandomHeaders() {
  const ua = getRandomUserAgent();
  const isChrome = ua.includes('Chrome') && !ua.includes('Edg');
  const isEdge = ua.includes('Edg');
  const isFirefox = ua.includes('Firefox');

  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': randomItem(ACCEPT_LANGUAGES),
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  if (Math.random() > 0.5) {
    headers['DNT'] = '1';
  }

  if (isChrome) {
    headers['sec-ch-ua'] = `"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"`;
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = Math.random() > 0.5 ? '"macOS"' : '"Windows"';
  } else if (isEdge) {
    headers['sec-ch-ua'] = `"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"`;
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = '"Windows"';
  }

  return { userAgent: ua, headers };
}

const BLOCKED_RESOURCE_TYPES = new Set(['image', 'font', 'media']);
const BLOCKED_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
  'doubleclick.net',
  'hotjar.com',
  'fullstory.com',
  'segment.com',
  'optimizely.com',
  'newrelic.com',
  'sentry.io',
];

function shouldBlockRequest(req) {
  if (BLOCKED_RESOURCE_TYPES.has(req.resourceType())) return true;
  const url = req.url();
  return BLOCKED_DOMAINS.some(domain => url.includes(domain));
}

function getProxyArgs() {
  const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  return proxy ? [`--proxy-server=${proxy}`] : [];
}

module.exports = {
  randomDelay,
  getRandomUserAgent,
  getRandomViewport,
  getRandomHeaders,
  shouldBlockRequest,
  getProxyArgs,
};
