import bcrypt from 'bcrypt';

export const DEMO_EMAIL = 'demo@ikofi.test';
export const DEMO_PASSWORD = 'demo-password';

// Today in Kigali as [year, monthIndex (0–11), day].
function kigaliToday() {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali' })
    .format(new Date())
    .split('-')
    .map(Number);
  return [year, month - 1, day];
}

const iso = (date) => date.toISOString().slice(0, 10);

// 'YYYY-MM-DD' for `day` of the month `monthsAgo` months before this one (negative = future).
// A day past the end of a short month is clamped: 31 becomes 30 in September.
function dayOf(monthsAgo, day) {
  const [year, month] = kigaliToday();
  const lastDay = new Date(Date.UTC(year, month - monthsAgo + 1, 0)).getUTCDate();
  return iso(new Date(Date.UTC(year, month - monthsAgo, Math.min(day, lastDay))));
}

function daysFromToday(n) {
  const [year, month, day] = kigaliToday();
  return iso(new Date(Date.UTC(year, month, day + n)));
}

// Varies an amount by up to ±2,500 in steps of 500, the same way on every run.
const vary = (base, seed) => base + (((seed * 7919) % 11) - 5) * 500;

export async function seedDemo(pool) {
  const today = daysFromToday(0);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL]);
    if (existing.rows[0]) {
      console.log('demo user already exists; rebuild the database to re-seed it');
      await client.query('ROLLBACK');
      return;
    }

    const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const { rows: [user] } = await client.query(
      `INSERT INTO users (full_name, email, password_hash, city, daily_limit)
       VALUES ('Demo User', $1, $2, 'Kigali', 15000)
       RETURNING id`,
      [DEMO_EMAIL, hash],
    );
    const userId = user.id;

    // Global categories by name, e.g. categories.Food -> 3
    const categories = Object.fromEntries(
      (await client.query('SELECT id, name FROM categories WHERE user_id IS NULL')).rows.map((c) => [c.name, c.id]),
    );

    const accounts = {};
    for (const [key, name, type, opening, last4] of [
      ['momo', 'MTN MoMo', 'mobile_money', 120000, '7812'],
      ['bank', 'Bank of Kigali', 'bank', 300000, '0329'],
      ['cash', 'Cash', 'cash', 20000, null],
    ]) {
      const { rows } = await client.query(
        `INSERT INTO accounts (user_id, name, type, opening_balance, balance, account_number_last4)
         VALUES ($1, $2, $3, $4, $4, $5)
         RETURNING id`,
        [userId, name, type, opening, last4],
      );
      accounts[key] = rows[0].id;
    }

    // ~7 months of history ending today. Future dates are skipped.
    const transactions = [];
    const tx = (account, category, type, amount, description, date) => {
      if (date <= today) transactions.push([accounts[account], categories[category], type, amount, description, date]);
    };
    const transfers = [];
    const transfer = (from, to, amount, description, date) => {
      if (date <= today) transfers.push([accounts[from], accounts[to], amount, description, date]);
    };

    for (let k = 6; k >= 0; k--) {
      tx('bank', 'Salary', 'income', 650000, 'Salary', dayOf(k, 25));
      if (k % 2 === 0) tx('momo', 'Freelance', 'income', vary(80000, k), 'Freelance project', dayOf(k, 12));
      tx('bank', 'Housing', 'expense', 150000, 'Rent', dayOf(k, 15));
      tx('bank', 'Utilities', 'expense', vary(12000, k), 'Electricity', dayOf(k, 5));
      tx('momo', 'Utilities', 'expense', 5000, 'MTN airtime', dayOf(k, 18));
      [3, 10, 17, 24].forEach((day, i) => tx('momo', 'Food', 'expense', vary(26000, k * 4 + i), 'Groceries at Simba', dayOf(k, day)));
      [2, 6, 9, 13, 16, 20, 23, 27].forEach((day) => tx('cash', 'Transport', 'expense', 1500, 'Moto to campus', dayOf(k, day)));
      tx('momo', 'Entertainment', 'expense', vary(6000, k), 'Cinema night', dayOf(k, 11));
      if (k % 3 === 0) tx('cash', 'Health', 'expense', vary(4200, k), 'Pharmacy', dayOf(k, 10));
      if (k % 2 === 1) tx('bank', 'Education', 'expense', vary(25000, k), 'Course books', dayOf(k, 8));
      transfer('bank', 'momo', 120000, 'Top up MoMo', dayOf(k, 26));
      transfer('bank', 'cash', 15000, 'Cash withdrawal', dayOf(k, 1));
    }

    for (const row of transactions) {
      await client.query(
        `INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, ...row],
      );
    }
    for (const row of transfers) {
      await client.query(
        `INSERT INTO transfers (user_id, from_account_id, to_account_id, amount, description, date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, ...row],
      );
    }

    // Budgets for the current month
    const month = dayOf(0, 1);
    for (const [category, limit] of [
      ['Food', 100000], ['Transport', 50000], ['Utilities', 30000],
      ['Housing', 150000], ['Entertainment', 40000], ['Education', 60000],
    ]) {
      await client.query(
        'INSERT INTO budgets (user_id, category_id, amount_limit, month) VALUES ($1, $2, $3, $4)',
        [userId, categories[category], limit, month],
      );
    }

    // Goals and their contributions
    const goal = async (name, target, deadline) =>
      (await client.query(
        `INSERT INTO savings_goals (user_id, name, target_amount, deadline)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [userId, name, target, deadline],
      )).rows[0].id;
    const laptop = await goal('New laptop', 600000, daysFromToday(150));
    const emergency = await goal('Emergency fund', 500000, null);
    const fees = await goal('School fees', 400000, daysFromToday(30));

    for (const [goalId, account, amount, date] of [
      [laptop, 'bank', 60000, dayOf(3, 27)],
      [laptop, 'bank', 60000, dayOf(2, 27)],
      [laptop, 'bank', 60000, dayOf(1, 27)],
      [emergency, 'momo', 50000, dayOf(2, 20)],
      [emergency, 'momo', 50000, dayOf(0, 1)],
      [fees, 'bank', 200000, dayOf(5, 27)],
      [fees, 'bank', 200000, dayOf(4, 27)],
    ]) {
      await client.query(
        `INSERT INTO goal_contributions (user_id, goal_id, account_id, amount, date)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, goalId, accounts[account], amount, date],
      );
    }
    await client.query(
      `UPDATE savings_goals g
       SET current_amount = c.total,
           completed_at   = CASE WHEN c.total >= g.target_amount THEN now() END
       FROM (SELECT goal_id, SUM(amount) AS total FROM goal_contributions GROUP BY goal_id) c
       WHERE c.goal_id = g.id AND g.user_id = $1`,
      [userId],
    );

    // Bills
    const [, , todayDay] = kigaliToday();
    for (const [name, amount, dueDate, recurring, category] of [
      ['Rent', 150000, todayDay < 15 ? dayOf(0, 15) : dayOf(-1, 15), true, 'Housing'],
      ['Electricity', 12000, daysFromToday(5), false, 'Utilities'],
      ['Internet', 25000, daysFromToday(10), true, 'Utilities'],
    ]) {
      await client.query(
        `INSERT INTO bills (user_id, name, amount, due_date, is_recurring, category_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, name, amount, dueDate, recurring, categories[category]],
      );
    }

    // Balances from history (the same formula as check-balances.js)
    await client.query(
      `UPDATE accounts a
       SET balance = a.opening_balance
         + COALESCE((SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)
                     FROM transactions WHERE account_id = a.id), 0)
         + COALESCE((SELECT SUM(amount) FROM transfers WHERE to_account_id   = a.id), 0)
         - COALESCE((SELECT SUM(amount) FROM transfers WHERE from_account_id = a.id), 0)
         - COALESCE((SELECT SUM(amount) FROM goal_contributions WHERE account_id = a.id), 0),
           updated_at = now()
       WHERE a.user_id = $1`,
      [userId],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}