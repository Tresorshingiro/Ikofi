import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

const { rows } = await pool.query(`SELECT filename FROM schema_migrations`);
const applied = new Set(rows.map((row) => row.filename));
const files = (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort();

for (const file of files) {
    if (applied.has(file)) continue;

    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`failed ${file}: ${err.message}`);
        process.exitCode = 1;
        break;
    } finally {
        client.release();
    }
}

await pool.end();