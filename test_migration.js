/**
 * Basic unit tests for the migration engine.
 * Run with `npm test`.
 */

import assert from 'assert';
import { registerMigration, runMigrations, getCurrentVersion } from './migration.js';
import config from './config.js';
import { openDB } from 'idb';

// Clean up any existing test DB before each run.
async function resetTestDB() {
    const db = await openDB(config.DB_NAME, 1, {
        upgrade(upgradeDb) {
            // Delete all object stores.
            for (const name of upgradeDb.objectStoreNames) {
                upgradeDb.deleteObjectStore(name);
            }
        }
    });
    await db.clear('meta').catch(() => {}); // Ensure meta store is empty.
    db.close();
}

// Register dummy migrations for testing.
registerMigration(10, 'Test migration #10', async (db) => {
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put('test10', 'dummy');
    await tx.done;
});

registerMigration(20, 'Test migration #20', async (db) => {
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put('test20', 'dummy');
    await tx.done;
});

(async () => {
    await resetTestDB();

    // Initial version should be 0.
    const startVersion = await getCurrentVersion();
    assert.strictEqual(startVersion, 0, 'Initial DB version should be 0');

    // Run migrations – expect both to be applied.
    await runMigrations();

    const afterVersion = await getCurrentVersion();
    assert.strictEqual(afterVersion, 20, 'DB version should be updated to latest migration (20)');

    // Re‑run migrations – should detect no pending work.
    await runMigrations(); // Should not throw.

    console.log('✅ All migration tests passed.');
})();