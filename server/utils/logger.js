const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const logger = {
  info: (message, prefix = '') => {
    const timestamp = new Date().toISOString();
    console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${prefix ? `${colors.bright}[${prefix}]${colors.reset} ` : ''}${message}`);
  },

  success: (message, prefix = '') => {
    const timestamp = new Date().toISOString();
    console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${prefix ? `${colors.bright}[${prefix}]${colors.reset} ` : ''}${colors.green}✅ ${message}${colors.reset}`);
  },

  error: (message, prefix = '') => {
    const timestamp = new Date().toISOString();
    console.error(`${colors.cyan}[${timestamp}]${colors.reset} ${prefix ? `${colors.bright}[${prefix}]${colors.reset} ` : ''}${colors.red}❌ ${message}${colors.reset}`);
  },

  warn: (message, prefix = '') => {
    const timestamp = new Date().toISOString();
    console.warn(`${colors.cyan}[${timestamp}]${colors.reset} ${prefix ? `${colors.bright}[${prefix}]${colors.reset} ` : ''}${colors.yellow}⚠️  ${message}${colors.reset}`);
  },

  debug: (message, prefix = '') => {
    if (process.env.DEBUG_SCRAPING === 'true') {
      const timestamp = new Date().toISOString();
      console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${prefix ? `${colors.bright}[${prefix}]${colors.reset} ` : ''}${colors.dim}🔍 ${message}${colors.reset}`);
    }
  },

  store: (storeName, message, type = 'info') => {
    const methods = {
      info: logger.info,
      success: logger.success,
      error: logger.error,
      warn: logger.warn,
      debug: logger.debug
    };
    
    methods[type](message, storeName);
  }
};

module.exports = logger;
