/**
 * Configuration module.
 *
 * In a Node environment it loads variables from `.env` using `dotenv`.
 * In the browser it reads from `window.__CONFIG__`.
 */

let config = {
    DB_NAME: 'my_app_db',
    DB_VERSION: 1,
    LOG_LEVEL: 'info'
};

if (typeof process !== 'undefined' && process.env) {
    // Node execution (e.g., tests)
    try {
        // eslint-disable-next-line node/no-unpublished-require
        const dotenv = require('dotenv');
        dotenv.config();
        config = {
            DB_NAME: process.env.DB_NAME || config.DB_NAME,
            DB_VERSION: Number(process.env.DB_VERSION) || config.DB_VERSION,
            LOG_LEVEL: process.env.LOG_LEVEL || config.LOG_LEVEL
        };
    } catch (e) {
        // dotenv not installed – ignore; defaults remain.
    }
} else if (typeof window !== 'undefined' && window.__CONFIG__) {
    // Browser execution
    config = {
        DB_NAME: window.__CONFIG__.DB_NAME || config.DB_NAME,
        DB_VERSION: Number(window.__CONFIG__.DB_VERSION) || config.DB_VERSION,
        LOG_LEVEL: window.__CONFIG__.LOG_LEVEL || config.LOG_LEVEL
    };
}

export default config;