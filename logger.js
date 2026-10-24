/**
 * Simple logger with configurable levels.
 *
// rewrote this part
 * Levels (lowest → highest): debug, info, warn, error
 */

const levels = ['debug', 'info', 'warn', 'error'];
let currentLevelIndex = levels.indexOf('info');
let externalTarget = null;

/**
 * Set the minimum log level.
 * @param {string} level
 */
export function setLogLevel(level) {
    const idx = levels.indexOf(level);
    if (idx === -1) throw new Error(`Invalid log level: ${level}`);
    currentLevelIndex = idx;
}

/**
 * Set an external log target (e.g., UI callback).
 * @param {(msg: string) => void} fn
 */
export function setLogTarget(fn) {
    externalTarget = fn;
}

/**
 * Core logging function.
 * @param {string} level
 * @param {string} message
 * @param {any} [meta]
 */
export function log(level, message, meta) {
    if (levels.indexOf(level) < currentLevelIndex) return;
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    console[level] ? console[level](formatted) : console.log(formatted);
    if (meta) console[level] ? console[level](meta) : console.log(meta);
    if (externalTarget) externalTarget(formatted);
}

/**
 * Convenience wrappers.
 */
export function debug(msg, meta) { log('debug', msg, meta); }
export function info(msg, meta) { log('info', msg, meta); }
export function warn(msg, meta) { log('warn', msg, meta); }
export function error(msg, meta) { log('error', msg, meta); }