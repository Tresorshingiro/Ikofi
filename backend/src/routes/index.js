import { Router } from 'express';
import { pool } from '../db/pool.js';

export const apiRouter = Router();

apiRouter.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ data: { status: 'ok', db: 'ok' } });
});