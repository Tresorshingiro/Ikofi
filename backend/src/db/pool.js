import pg from 'pg';
import { env } from '../config/env.js';

const { Pool, types } = pg;

types.setTypeParser(1700, parseFloat);
types.setTypeParser(20, (value) => parseInt(value, 10));

types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.isProd ? { rejectUnauthorized: false } : false,
    options: '-c timezone=Africa/Kigali',
});