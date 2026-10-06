import { pool } from './pool.js';

const { rows } = await pool.query(`
  SELECT * FROM (
    SELECT a.id, a.user_id, a.name, a.balance AS stored,
           a.opening_balance
           + COALESCE((SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)
                       FROM transactions WHERE account_id = a.id), 0)
           + COALESCE((SELECT SUM(amount) FROM transfers WHERE to_account_id   = a.id), 0)
           - COALESCE((SELECT SUM(amount) FROM transfers WHERE from_account_id = a.id), 0)
           - COALESCE((SELECT SUM(amount) FROM goal_contributions WHERE account_id = a.id), 0) AS expected
    FROM accounts a
  ) checked
  WHERE stored <> expected`);

if (rows.length === 0) {
  console.log('All account balances match their history.');
} else {
  console.table(rows);
  process.exitCode = 1;
}

await pool.end();