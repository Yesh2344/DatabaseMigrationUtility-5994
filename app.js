/**
 * Main entry point for the browser UI.
 * Handles UI interactions, injects configuration, and wires up the migration engine.
 */

import { runMigrations } from './migration.js';
import { setLogTarget } from './logger.js';

/**
 * Append a line to the UI log output.
 * @param {string} line
 */
function appendLog(line) {
    const output = document.getElementById('log-output');
    output.textContent += line + '\n';
    output.scrollTop = output.scrollHeight;
}

// Redirect logger output to the UI.
setLogTarget(appendLog);

// Bind UI controls.
document.getElementById('run-migrations').addEventListener('click', async () => {
    try {
        await runMigrations();
        appendLog('✅ All migrations completed successfully.');
    } catch (err) {
        appendLog(`❌ Migration failed: ${err.message}`);
    }
});