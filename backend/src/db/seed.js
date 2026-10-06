import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import { pool } from './pool.js';

const seedsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seeds');

// 1. Global default categories
await pool.query(await readFile(path.join(seedsDir, '01_categories.sql'), 'utf8'));
console.log('seeded categories');

// 2. One admin, from the environment
const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
  const hash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ('Ikofi Admin', $1, $2, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [SEED_ADMIN_EMAIL.toLowerCase(), hash],
  );
  console.log('seeded admin');
}

// 3. Demo user — development only
if (process.argv.includes('--demo')) {
  const { seedDemo } = await import('./seeds/03_demo.js'); // builds the data described in §2.4
  await seedDemo(pool);
  console.log('seeded demo user');
}

await pool.end();