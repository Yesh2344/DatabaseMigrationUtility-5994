/**
 * Migration engine using IndexedDB.
 *
 * Provides:
 *   - registerMigration(version, description, fn)
 *   - runMigrations()
 *   - getCurrentVersion()
 *
 * All migrations are stored in an internal Map and executed sequentially.
 */

import { openDB } from 'idb';
import { log, error, info } from './logger.js';
import config from './config.js';

/** @type {Map<number, {description: string, fn: (db: IDBDatabase) => Promise<void>}>} */
const migrations = new Map();

/**
 * Register a migration.
 * @param {number} version Must be greater than 0 and unique.
 * @param {string} description Human‑readable description.
 * @param {(db: IDBDatabase) => Promise<void>} fn Async function that receives an open IndexedDB instance.
 */
export function registerMigration(version, description, fn) {
    if (migrations.has(version)) {
        throw new Error(`Migration version ${version} is already registered.`);
    }
    migrations.set(version, { description, fn });
    log('debug', `Registered migration v${version}: ${description}`);
}

/**
 * Retrieve the stored schema version from IndexedDB.
 * @returns {Promise<number>}
 */
export async function getCurrentVersion() {
    const db = await openDB(config.DB_NAME, 1, {
        upgrade(upgradeDb) {
            if (!upgradeDb.objectStoreNames.contains('meta')) {
                upgradeDb.createObjectStore('meta');
            }
        }
    });
    const version = await db.get('meta', 'schemaVersion');
    await db.close();
    return version ?? 0;
}

/**
 * Persist the current schema version.
 * @param {IDBDatabase} db
 * @param {number} version
 */
async function setCurrentVersion(db, version) {
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put(version, 'schemaVersion');
    await tx.done;
}

/**
 * Run all pending migrations in order.
 * @returns {Promise<void>}
 */
export async function runMigrations() {
    const currentVersion = await getCurrentVersion();
    info(`Current DB version: ${currentVersion}`);

    const pending = [...migrations.entries()]
        .filter(([v]) => v > currentVersion)
        .sort((a, b) => a[0] - b[0]);

    if (pending.length === 0) {
        info('No pending migrations.');
        return;
    }

    const db = await openDB(config.DB_NAME, config.DB_VERSION, {
        upgrade(upgradeDb) {
            // Ensure meta store exists for version tracking.
            if (!upgradeDb.objectStoreNames.contains('meta')) {
                upgradeDb.createObjectStore('meta');
            }
        }
    });

    try {
        for (const [version, { description, fn }] of pending) {
            info(`Applying migration v${version}: ${description}`);
            try {
                await fn(db);
                await setCurrentVersion(db, version);
                info(`✅ Migration v${version} applied.`);
            } catch (e) {
                error(`Migration v${version} failed: ${e.message}`, e);
                throw e; // Propagate to abort further migrations.
            }
        }
    } finally {
        db.close();
    }
}

/* -------------------------------------------------------------------------
 * Example migrations – in a real project these would be in separate files.
 * ----------------------------------------------------------------------- */

registerMigration(1, 'Create "users" object store', async (db) => {
    if (!db.objectStoreNames.contains('users')) {
        const version = db.version + 1;
        db.close(); // Close current connection before version bump.
        const upgraded = await openDB(config.DB_NAME, version, {
            upgrade(upgradeDb) {
                upgradeDb.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            }
        });
        upgraded.close();
    }
});

registerMigration(2, 'Add "email" index to "users"', async (db) => {
    if (db.objectStoreNames.contains('users')) {
        const version = db.version + 1;
        db.close();
        const upgraded = await openDB(config.DB_NAME, version, {
            upgrade(upgradeDb) {
                const store = upgradeDb.transaction.objectStore('users');
                store.createIndex('email_idx', 'email', { unique: true });
            }
        });
        upgraded.close();
    }
});