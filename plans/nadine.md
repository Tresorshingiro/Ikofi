# Nadine's plan

Welcome to Ikofi! 👋

**What we are building:** a web app that helps people manage their money. You record income and expenses across mobile money (MoMo), bank and cash, set monthly budgets, save toward goals (a laptop, school fees…), keep track of bills, and see reports. The designs are in `mockups/*.html`; open them in your browser, because they show exactly what each screen must look like.

**Who does what:** you and Tresor each own whole **features**. For example, you build Accounts from the database query all the way to the page. Tresor builds the trickier parts (login, money moving between accounts, report calculations) and reviews your work. His plan is `plans/tresor.md`; you never need to read it. Everything you need is in this file.

**How to read a task**
- **Wait for:** what Tresor must have merged into `main` before you start. If it isn't there yet, ask him.
- **Code:** every file you create, with an explanation **before** it of what it does and why. Type it in yourself rather than copy-pasting: you learn far more, and you'll notice things to ask about.
- **Check:** how you know you're done. Then you open a pull request.

Phases 0–3 contain all their code. Later phases list the tasks and their code arrives in the next update of this plan.

---

## The basics (read once, come back whenever)

### The stack in one paragraph
**PostgreSQL** stores the data in tables. **Express** (running on **Node.js**) is the API: it receives requests like `GET /api/accounts`, runs SQL, and answers with JSON. **React** draws the pages in the browser and calls the API. Tailwind CSS styles them with small class names (`bg-surface`, `text-ink-muted`). Everything is plain JavaScript.

### Where things live
```
backend/                    the API (Express + PostgreSQL)
  src/db/migrations/        numbered .sql files that create the tables (never edit one that is on main)
  src/routes/               which URL goes to which controller
  src/controllers/          read the request, call a model, send the response
  src/models/               the SQL. One function = one SQL statement
  src/services/             rules that need several SQL statements together
  src/validators/           what a valid request body looks like (zod)
  http/                     clickable test requests (VS Code REST Client)
client/                     the React app
  src/api/                  one function per API endpoint
  src/hooks/                React Query hooks that call those functions and cache the results
  src/components/ui/        small reusable pieces (Button, Card, inputs…)
  src/features/<thing>/     pieces for one feature (AccountCard, AccountForm…)
  src/pages/                one component per page/route
mockups/                    the designs
```

**The one rule for the backend:** controllers never contain SQL, models never touch `req`/`res`. A request flows **route → controller → model → database** and back.

### How the API answers
- Success: `{ "data": … }`. Lists can add `"meta": { … }`.
- Error: `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "amount": "Must be greater than 0" } } }`. `fields` tells the form which message goes under which input.
- **404 also means "not yours".** Every query on a user's data has `AND user_id = $…`, so another person's account simply isn't found. We never say "that exists but isn't yours".
- Dates are `'YYYY-MM-DD'` strings; months are `'YYYY-MM'`.

### Design classes you'll use all the time
| What | Classes |
|---|---|
| Backgrounds | `bg-bg` (page), `bg-surface` (cards), `bg-surface-raised` (inputs, tiles), `bg-line` (icon circles) |
| Text | `text-ink` (main), `text-ink-soft`, `text-ink-secondary`, `text-ink-muted` (grey captions), `text-accent` (orange) |
| Status | `text-success` + `bg-success-bg` (green), `text-danger` + `bg-danger-bg` (red), `text-warning` + `bg-warning-bg` (yellow) |
| Borders | `border-line` (normal), `border-line-strong` (inputs) |
| Corners | `rounded-card` (24px cards), `rounded-tile` (16px), `rounded-input` (14px), `rounded-field` (12px), `rounded-pill` (fully round) |
| Fonts | `font-heading` (Sora: titles and money), default body font is Manrope |
| Motion | `animate-up` (slide in), `lift` (hover: rise + orange border), `row-hover`, `btn-hover`, `field` (orange focus ring) |
| Screen sizes | no prefix = phones; `md:` ≥ 768px, `lg:` ≥ 1024px, `xl:` ≥ 1280px |

### Components Tresor builds that you will use
`Button` (`variant`: primary/outline/ghost/dark/danger; `size`: sm/md/lg; `icon`; `loading`; `as={Link}`), `IconButton` (`icon`, `label`), `Card` (`title`, `headerRight`, `delay`), `Icon` (`name`, e.g. `plus`, `edit`, `trash`, `wallet`, `eye`, `eyeOff`, `arrowRight`, `chevronDown`), `Logo`, `Avatar`, `Modal` (`open`, `onClose`, `title`), `ConfirmDialog`, `useToast()` (`toast.success('Saved')`), `DataTable`, `Pagination`, `Skeleton`, `TopBar` (`title`, `subtitle`, `action`), the charts, and helpers `formatMoney` (`lib/formatMoney.js`) and `lib/dates.js`. You can see all of them at `http://localhost:5173/dev/components`.

---

## Your Git routine

You work on **one branch, `nadine`**, for the whole project. You never commit to `main` directly (GitHub blocks it).

**Before starting any task** (and whenever Tresor says something was merged):
```bash
git switch nadine
git pull origin main        # bring everything new from main into your branch
cd backend
npm install                 # install any new packages
npm run migrate             # apply any new database migrations
```
(After Phase 0C, also run `npm install` inside `client/`.)

**While working**, save your progress often:
```bash
git status                  # see what changed. .env must never appear here
git add .
git commit -m "Accounts: add list and create endpoints"   # say what you did
git push                    # uploads your branch to GitHub
```

**When a task is finished**
1. Push, then on GitHub click **Compare & pull request**. Base: `main` ← compare: `nadine`.
2. In the description, write what you did and paste the task's **Check** list with ticks.
3. Tresor reviews. If he asks for changes, make them on `nadine` and push; the pull request updates by itself.
4. After he merges, run the "before starting any task" commands, then start the next task.

**Rules**
- Never edit a migration file that is already on `main`. To change the database, ask Tresor.
- Never commit `.env` (it contains your password).
- Stuck for more than 30 minutes? Ask Tresor, and paste the **exact** error message.

---

## Phase 0B — Get the project running

**Wait for:** Tresor says the first push is done.

**Goal:** the API and database running on your computer, plus some SQL practice before you write app code.

### 1. Install the tools
- **Node.js 20.12 or newer** (nodejs.org, the LTS version). Check: `node -v`.
- **PostgreSQL 16** (postgresql.org). During installation you choose a password for the `postgres` user; **write it down**. Make sure "Command Line Tools" is ticked so you get `psql`.
- **Git** (git-scm.com). Then tell Git who you are, once:
  ```bash
  git config --global user.name "Nadine …"
  git config --global user.email "you@example.com"
  ```
- **VS Code** with the extensions **REST Client** and **PostgreSQL**. Do **not** install the **MSSQL** extension: it checks a different SQL dialect and underlines correct code in red.

### 2. Download the project
Accept the GitHub invitation from Tresor (check your email), then:
```bash
git clone https://github.com/<tresor>/ikofi.git
cd ikofi
git switch -c nadine          # create your branch (only this once)
git push -u origin nadine
cd backend
npm install
copy .env.example .env        # Windows. On Mac/Linux: cp .env.example .env
```

### 3. Tell the app your database password
Open `backend/.env` in VS Code. Change the `DATABASE_URL` line to use your password:
```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ikofi
```
`.env` stays on your computer only (it's in `.gitignore`).

### 4. Create the database and start the API
```bash
psql -U postgres -c "CREATE DATABASE ikofi;"
npm run migrate          # creates all tables: prints "applied 001_…" up to "applied 014_…"
npm run seed:demo        # adds categories, an admin and a demo user with 7 months of data
npm run check:balances   # prints "All account balances match their history."
npm run dev              # starts the API. Leave this terminal open
```
Open `http://localhost:4000/api/health` in your browser. You should see:
```json
{"data":{"status":"ok","db":"ok"}}
```

**If something fails:** `password authentication failed` means the password in `.env` is wrong. `psql: command not found` means PostgreSQL's `bin` folder is not on your PATH (search "add psql to PATH Windows"). `Cannot use import statement` means you need to pull the latest `main`.

### 5. SQL practice (your first pull request)

Open `docs/sql-notes.md`. For each question, write a `SELECT` that answers it, run it, and paste the query and result under the question. To run queries: `psql -U postgres -d ikofi` in a terminal (type `\q` to quit), or the VS Code PostgreSQL extension.

Useful to know first:
- The demo user is `demo@ikofi.test`. Every table has a `user_id`, so most queries start with `WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')`.
- `CURRENT_DATE` is today. `date_trunc('month', CURRENT_DATE)` is the first day of this month.
- Look at a table's columns with `\d transactions` inside psql.

Try each one yourself **before** opening the answer.

<details><summary>1. List the demo user's accounts with their type and balance, biggest balance first.</summary>

```sql
SELECT name, type, balance
FROM accounts
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
ORDER BY balance DESC;
```
The inner `SELECT` (a *subquery*) finds the demo user's id, so you don't have to know it.
</details>

<details><summary>2. Total balance across accounts that are not archived.</summary>

```sql
SELECT SUM(balance) AS total_balance
FROM accounts
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND is_archived = false;
```
`SUM` is an *aggregate*: it turns many rows into one number.
</details>

<details><summary>3. How much was spent on Food this month?</summary>

```sql
SELECT COALESCE(SUM(t.amount), 0) AS food_this_month
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND t.type = 'expense'
  AND c.name = 'Food'
  AND t.date >= date_trunc('month', CURRENT_DATE);
```
`JOIN` connects each transaction to its category row so we can filter by the category's **name**. `COALESCE(x, 0)` turns "no rows → NULL" into 0.
</details>

<details><summary>4. Total income and total expenses last month.</summary>

```sql
SELECT
  SUM(amount) FILTER (WHERE type = 'income')  AS income,
  SUM(amount) FILTER (WHERE type = 'expense') AS expenses
FROM transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
  AND date <  date_trunc('month', CURRENT_DATE);
```
`FILTER (WHERE …)` lets one query compute two different sums. The date range is "from the 1st of last month, up to (but not including) the 1st of this month", the standard way to select a whole month.
</details>

<details><summary>5. The three biggest expenses last month.</summary>

```sql
SELECT description, amount, date
FROM transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND type = 'expense'
  AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
  AND date <  date_trunc('month', CURRENT_DATE)
ORDER BY amount DESC
LIMIT 3;
```
</details>

<details><summary>6. Number of transactions in each category, most first.</summary>

```sql
SELECT c.name, COUNT(*) AS transactions
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
GROUP BY c.name
ORDER BY transactions DESC;
```
`GROUP BY` makes one result row per category; `COUNT(*)` counts the rows in each group.
</details>

<details><summary>7. Spending per category this month, biggest first.</summary>

```sql
SELECT c.name, SUM(t.amount) AS spent
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND t.type = 'expense'
  AND t.date >= date_trunc('month', CURRENT_DATE)
GROUP BY c.name
ORDER BY spent DESC;
```
</details>

<details><summary>8. Income and expenses per month for the last 6 months, oldest first.</summary>

```sql
SELECT to_char(date_trunc('month', date), 'YYYY-MM') AS month,
       SUM(amount) FILTER (WHERE type = 'income')  AS income,
       SUM(amount) FILTER (WHERE type = 'expense') AS expenses
FROM transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
GROUP BY 1
ORDER BY 1;
```
`GROUP BY 1` means "group by the first column of the SELECT".
</details>

<details><summary>9. This month's budgets: category, limit, spent, remaining.</summary>

```sql
SELECT c.name,
       b.amount_limit,
       COALESCE(SUM(t.amount), 0)                  AS spent,
       b.amount_limit - COALESCE(SUM(t.amount), 0) AS remaining
FROM budgets b
JOIN categories c ON c.id = b.category_id
LEFT JOIN transactions t
       ON t.user_id     = b.user_id
      AND t.category_id = b.category_id
      AND t.type        = 'expense'
      AND t.date >= b.month
      AND t.date <  b.month + INTERVAL '1 month'
WHERE b.user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
  AND b.month = date_trunc('month', CURRENT_DATE)
GROUP BY b.id, c.name
ORDER BY c.name;
```
`LEFT JOIN` keeps a budget even when it has **no** transactions yet (a normal `JOIN` would drop it). The app's real Budgets page runs almost exactly this query.
</details>

<details><summary>10. Each savings goal with saved amount, target and percentage complete.</summary>

```sql
SELECT name,
       current_amount,
       target_amount,
       ROUND(100.0 * current_amount / target_amount, 1) AS pct
FROM savings_goals
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@ikofi.test')
ORDER BY pct DESC;
```
`100.0` (not `100`) forces decimal division.
</details>

Commit `docs/sql-notes.md`, push, and open your **first pull request**.

**Check:** ☐ health shows `ok` ☐ `check:balances` passes ☐ all ten queries answered with results ☐ PR opened

---

## Phase 0C — Run the frontend

**Wait for:** Tresor merges the client.

```bash
git switch nadine
git pull origin main
cd client
npm install
npm run dev                 # open http://localhost:5173
```
Keep the API running in a second terminal (`cd backend && npm run dev`). The browser talks to `localhost:5173`, and Vite forwards every `/api/…` call to the API on port 4000.

**Check:** ☐ the app opens at `localhost:5173` ☐ no red errors in the browser console (F12 → Console)

---


## Phase 1 — Components and the landing page

**Wait for:** Tresor's Phase 1 task 1 (`Icon`, `Button`, `Card`, `formatMoney`, `categoryColors`, the gallery page).

**Goal:** the small building blocks every screen uses, and the public landing page. A **component** is a function that returns what to draw; its **props** are its inputs. For example, `<Badge tone="success">On track</Badge>` calls `Badge` with `tone` and `children`.

Every component goes in `client/src/components/ui/` and is added to **your gallery file**, `client/src/pages/dev/PrimitivesGallery.jsx`, so you can see it at `localhost:5173/dev/components` and compare it with the mockups. One pull request per task.

**Tool you'll see everywhere:** `clsx(...)` joins class names and skips the false ones: `clsx('a', isActive && 'b')` gives `'a b'` or `'a'`.

### Task 1 — Display components

**StatCard** is the big number card at the top of the Dashboard ("Total balance RWF 412,500, +12.4% vs last month"). `delta` is the percentage change; it's green when the change is good. For expenses, going *down* is good, which is what `goodWhen="down"` means.

**`client/src/components/ui/StatCard.jsx`**
```jsx
import { Card } from './Card.jsx';

const MINUS = '−';
const units = { '%': '%', pts: ' pts', count: '' };

// delta: { value: 12.4, unit: '%' }.  goodWhen="down" makes a decrease green (used for Expenses).
export function StatCard({ label, value, icon, delta, goodWhen = 'up', caption = 'vs last month', delay }) {
  const hasDelta = delta && delta.value !== null && delta.value !== undefined;
  const isGood = hasDelta && (goodWhen === 'up' ? delta.value >= 0 : delta.value <= 0);

  return (
    <Card delay={delay} className="!gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-line text-accent-soft">{icon}</span>
      </div>
      <div className="font-heading text-[28px] font-bold tracking-[-0.02em]">{value}</div>
      {hasDelta && (
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span
            className={
              isGood
                ? 'rounded-pill bg-success-bg px-2 py-0.5 font-bold text-success'
                : 'rounded-pill bg-danger-bg px-2 py-0.5 font-bold text-danger'
            }
          >
            {delta.value < 0 ? MINUS : '+'} {Math.abs(delta.value)}
            {units[delta.unit ?? '%']}
          </span>
          {caption}
        </div>
      )}
    </Card>
  );
}
```

**StatTile** is the smaller grey tile (the Income / Expenses / Net row on Transactions). `tone` picks the colour of the value.

**`client/src/components/ui/StatTile.jsx`**
```jsx
import clsx from 'clsx';

const tones = {
  default: 'text-ink',
  success: 'text-success',
  accent: 'text-accent-soft',
  danger: 'text-danger',
};

export function StatTile({ label, value, tone = 'default' }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-input bg-surface-raised px-[18px] py-3.5">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className={clsx('font-heading text-xl font-bold', tones[tone])}>{value}</span>
    </div>
  );
}
```

**ProgressBar** draws a bar filled to `value / max`. `Math.min`/`Math.max` keep it between 0 and 100% even when someone overspends (150% would overflow the card). `role="progressbar"` and the `aria-` attributes let screen readers announce the percentage.

**`client/src/components/ui/ProgressBar.jsx`**
```jsx
import clsx from 'clsx';

const tones = {
  gradient: 'bg-accent-gradient',
  accent: 'bg-accent',
  danger: 'bg-danger',
};

export function ProgressBar({ value, max = 100, tone = 'gradient', height = 8, delay = 0 }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className="rounded-pill bg-track"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx('h-full origin-left animate-fill rounded-pill', tones[tone])}
        style={{ width: `${pct}%`, animationDelay: `${delay}s` }}
      />
    </div>
  );
}
```

**LabeledProgress** is a label and a number above a progress bar ("Food · 68,000 / 100,000"). It *reuses* `ProgressBar` instead of drawing a new one.

**`client/src/components/ui/LabeledProgress.jsx`**
```jsx
import { ProgressBar } from './ProgressBar.jsx';

export function LabeledProgress({ label, right, value, max, tone = 'gradient', delay = 0 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-ink-muted">{right}</span>
      </div>
      <ProgressBar value={value} max={max} tone={tone} height={10} delay={delay} />
    </div>
  );
}
```

**CategoryPill** is the coloured category label in tables. The database stores a colour *key* (`'orange'`); `colorFor` turns it into the two exact colours from the mockups.

**`client/src/components/ui/CategoryPill.jsx`**
```jsx
import { colorFor } from '../../lib/categoryColors.js';

export function CategoryPill({ name, color }) {
  const { bg, fg } = colorFor(color);
  return (
    <span className="inline-block w-fit rounded-pill px-2.5 py-1 text-xs font-bold" style={{ background: bg, color: fg }}>
      {name}
    </span>
  );
}
```

**Badge** is a small status label ("On track", "+8.2%", "Mobile money"). `glass` is the see-through look used on top of the gradient account cards.

**`client/src/components/ui/Badge.jsx`**
```jsx
import clsx from 'clsx';

const tones = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  accent: 'bg-accent-tint text-accent-soft',
  neutral: 'bg-line text-ink-secondary',
  glass: 'bg-black/25 text-[#E6D6CB]',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={clsx('inline-flex w-fit items-center rounded-pill px-2.5 py-1 text-xs font-bold', tones[tone])}>
      {children}
    </span>
  );
}
```

**Chip** is a rounded label with an optional × button (Settings → Categories). The × only appears when you pass `onRemove`. Its `aria-label` says *what* will be removed, because a lone "×" means nothing to a screen reader.

**`client/src/components/ui/Chip.jsx`**
```jsx
import clsx from 'clsx';
import { Icon } from '../icons/Icon.jsx';

export function Chip({ label, onRemove }) {
  return (
    <span
      className={clsx(
        'flex items-center gap-2 rounded-pill border border-line-strong bg-surface-raised py-2 pl-3.5 text-sm font-semibold',
        onRemove ? 'pr-2' : 'pr-3.5',
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="grid h-6 w-6 place-items-center rounded-full bg-line-strong text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
        >
          <Icon name="close" size={12} strokeWidth={2.4} />
        </button>
      )}
    </span>
  );
}
```

**AddTile** is the dashed "+ Add account" box at the end of a grid. It's a real `<button>`, so it works with the keyboard for free.

**`client/src/components/ui/AddTile.jsx`**
```jsx
import { Icon } from '../icons/Icon.jsx';

export function AddTile({ label, hint, onClick, minHeight = 200 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minHeight }}
      className="lift flex flex-col items-center justify-center gap-2.5 rounded-card border-[1.5px] border-dashed border-line-dashed bg-transparent p-6 text-[15px] font-bold text-ink-secondary"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-line text-accent-soft">
        <Icon name="plus" size={22} strokeWidth={2} />
      </span>
      {label}
      {hint && <span className="text-[13px] font-medium text-ink-muted">{hint}</span>}
    </button>
  );
}
```

**ListRow** is one line in a list: icon on the left, title and subtitle in the middle, something on the right (Upcoming bills, Recent account activity, notifications). `truncate` cuts long text with "…" instead of breaking the layout.

**`client/src/components/ui/ListRow.jsx`**
```jsx
import clsx from 'clsx';
import { Icon } from '../icons/Icon.jsx';

const iconTones = {
  neutral: 'text-ink-secondary',
  success: 'text-success',
  accent: 'text-accent-soft',
  danger: 'text-danger',
};
const subtitleTones = {
  muted: 'text-ink-muted',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function ListRow({ icon, iconTone = 'neutral', title, subtitle, subtitleTone = 'muted', right }) {
  return (
    <div className="row-hover flex items-center gap-3.5 rounded-xl px-2.5 py-3">
      <span className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-line', iconTones[iconTone])}>
        <Icon name={icon} size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-bold">{title}</span>
        {subtitle && <span className={clsx('truncate text-xs', subtitleTones[subtitleTone])}>{subtitle}</span>}
      </div>
      {right && <div className="shrink-0 text-right">{right}</div>}
    </div>
  );
}
```

**EmptyState** is what a list shows when it has nothing yet. A new user should see "No accounts yet: Add account", never a blank space.

**`client/src/components/ui/EmptyState.jsx`**
```jsx
import { Icon } from '../icons/Icon.jsx';
import { Button } from './Button.jsx';

// action: { label, onClick } (optional)
export function EmptyState({ icon = 'wallet', title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-line text-accent-soft">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-muted">{message}</p>}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**Money** shows an amount, always through `formatMoney`, so every figure in the app looks the same (`RWF 412,500`, `690K`, `−32,400`).

**`client/src/components/ui/Money.jsx`**
```jsx
import { formatMoney } from '../../lib/formatMoney.js';

export function Money({ amount, compact = false, signed = false, currency = 'RWF', className }) {
  return <span className={className}>{formatMoney(amount, { compact, signed, currency })}</span>;
}
```

### Task 2 — Form components

Forms in this app follow one pattern: a `FormField` holds the label, the input, and the error message under it. Inputs are **controlled**: React holds the value in state (`value={…}`), and every keystroke calls `onChange`, which updates the state.

**FormField.** The `htmlFor` must equal the input's `id`; that link is what makes clicking the label focus the input and lets screen readers read the label. `role="alert"` makes a screen reader announce an error as soon as it appears.

**`client/src/components/ui/FormField.jsx`**
```jsx
// Label + control + error line. `error` is the message for this field from the server (or undefined).
export function FormField({ label, htmlFor, error, hint, labelRight, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-soft">
          {label}
        </label>
        {labelRight}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-[13px] text-ink-muted">{hint}</p>
      )}
    </div>
  );
}
```

**TextInput.** `aria-invalid` and `aria-describedby` point screen readers at the error message. `...rest` passes every other prop (`type`, `placeholder`, `value`, `onChange`…) straight to the `<input>`.

**`client/src/components/ui/TextInput.jsx`**
```jsx
import clsx from 'clsx';

const sizes = {
  md: 'h-[46px] rounded-field px-3.5 text-sm',
  lg: 'h-[54px] rounded-input px-[18px] text-base',
};

export function TextInput({ id, size = 'md', error, className, ...rest }) {
  return (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={clsx(
        'field w-full border bg-surface-raised text-ink placeholder:text-ink-faint',
        error ? 'border-danger' : 'border-line-strong',
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
```

**PasswordInput** is a `TextInput` plus an eye button that switches between hidden and visible. It *wraps* `TextInput` instead of copying it.

**`client/src/components/ui/PasswordInput.jsx`**
```jsx
import clsx from 'clsx';
import { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';
import { TextInput } from './TextInput.jsx';

export function PasswordInput({ className, ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <TextInput {...rest} type={visible ? 'text' : 'password'} className={clsx('pr-14', className)} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-1 my-auto grid h-11 w-11 place-items-center rounded-[10px] text-ink-muted hover:text-ink"
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}
```

**AmountInput** is the big money input. While you type it shows plain digits (`32400`); when you leave the field it shows separators (`32,400`). It only accepts digits (RWF has no cents) and gives the parent a **number**, or `''` when empty, never text.

**`client/src/components/ui/AmountInput.jsx`**
```jsx
import clsx from 'clsx';
import { useState } from 'react';

const grouped = new Intl.NumberFormat('en-US');

// value: number | ''   onChange(number | '')
export function AmountInput({ id, value, onChange, currency = 'RWF', error, ...rest }) {
  const [focused, setFocused] = useState(false);
  const empty = value === '' || value === null || value === undefined;
  const shown = empty ? '' : focused ? String(value) : grouped.format(value);

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric" // phones show the number keyboard
        autoComplete="off"
        placeholder="0"
        value={shown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, ''); // keep only 0–9
          onChange(digits === '' ? '' : Number(digits));
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          'field h-16 w-full rounded-input border bg-surface-raised pl-4 pr-16 font-heading text-[28px] font-bold text-ink placeholder:text-ink-faint',
          error ? 'border-danger' : 'border-line-strong',
        )}
        {...rest}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-ink-muted">
        {currency}
      </span>
    </div>
  );
}
```

**Select** is a styled native `<select>`. Native means the keyboard, screen readers and phone pickers all work without extra code. `filter` is the compact look used above tables ("All categories ▾"); `field` is the full-width look inside forms. `onChange` hands back the chosen **value** (always a string, because HTML gives strings; convert with `Number(…)` when you need a number).

**`client/src/components/ui/Select.jsx`**
```jsx
import clsx from 'clsx';
import { Icon } from '../icons/Icon.jsx';

const variants = {
  filter: 'h-10 min-w-[150px] border-line bg-surface font-semibold text-ink-soft',
  field: 'h-[46px] border-line-strong bg-surface-raised text-ink',
};

// options: [{ value, label }]. placeholder adds a first option with value ''.
// label is for filters with no visible label (it becomes the aria-label).
export function Select({ id, label, value, onChange, options, placeholder, variant = 'field', error }) {
  return (
    <div className={clsx('relative', variant === 'field' && 'w-full')}>
      <select
        id={id}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className={clsx(
          'field w-full cursor-pointer appearance-none rounded-field border pl-3.5 pr-10 text-sm [&>option]:bg-surface-raised',
          variants[variant],
          error && '!border-danger',
        )}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}
```

**Toggle** is the on/off switch in Preferences. `role="switch"` + `aria-checked` tell screen readers it's a switch and whether it's on.

**`client/src/components/ui/Toggle.jsx`**
```jsx
import clsx from 'clsx';
import { useId } from 'react';

export function Toggle({ checked, onChange, label, description, disabled = false }) {
  const labelId = useId();
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5">
      <div className="flex flex-col gap-0.5">
        <span id={labelId} className="text-[15px] font-semibold">
          {label}
        </span>
        {description && <span className="text-[13px] text-ink-muted">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'flex h-[30px] w-[52px] shrink-0 rounded-pill p-[3px] transition-colors disabled:opacity-50',
          checked ? 'bg-accent' : 'bg-bar-muted',
        )}
      >
        <span className={clsx('h-6 w-6 rounded-full bg-ink transition-transform duration-200', checked && 'translate-x-[22px]')} />
      </button>
    </div>
  );
}
```

**Checkbox** ("Keep me logged in"). `accent-accent` paints the native checkbox orange.

**`client/src/components/ui/Checkbox.jsx`**
```jsx
export function Checkbox({ id, checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2.5 text-[15px] text-ink-soft">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-[18px] w-[18px] accent-accent"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
```

**SegmentedControl** is a row of buttons where exactly one is selected: All / Income / Expenses, Log in / Sign up. Three looks from the mockups: `neutral` (filters), `accent` (Income/Expense in forms, selected = orange), `pill` (the round one on the login page). `aria-pressed` tells screen readers which one is selected.

**`client/src/components/ui/SegmentedControl.jsx`**
```jsx
import clsx from 'clsx';

const containers = {
  neutral: 'rounded-xl border border-line bg-surface p-1',
  accent: 'rounded-xl bg-surface-raised p-1',
  pill: 'rounded-pill border border-line bg-surface p-[5px]',
};
const sizes = {
  sm: 'h-8 px-3.5 text-[13px]',
  md: 'h-[38px] px-4 text-sm',
  lg: 'h-11 px-4 text-[15px]',
};

// options: [{ value, label }]. label: what the group is, for screen readers.
export function SegmentedControl({ options, value, onChange, variant = 'neutral', size = 'md', fullWidth = false, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={clsx(containers[variant], fullWidth ? 'grid' : 'inline-flex w-fit')}
      style={fullWidth ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'font-bold transition-colors',
              sizes[size],
              variant === 'pill' ? 'rounded-pill' : 'rounded-[9px]',
              selected
                ? variant === 'accent'
                  ? 'bg-accent text-ink-onAccent'
                  : 'bg-surface-active text-ink'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
```

### Your gallery file

Replace Tresor's stub with this. It uses `useState` so the form components actually work when you click them. Add to it whenever you build a component.

**`client/src/pages/dev/PrimitivesGallery.jsx`**
```jsx
import { useState } from 'react';
import { AddTile } from '../../components/ui/AddTile.jsx';
import { AmountInput } from '../../components/ui/AmountInput.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { CategoryPill } from '../../components/ui/CategoryPill.jsx';
import { Checkbox } from '../../components/ui/Checkbox.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { LabeledProgress } from '../../components/ui/LabeledProgress.jsx';
import { ListRow } from '../../components/ui/ListRow.jsx';
import { Money } from '../../components/ui/Money.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { SegmentedControl } from '../../components/ui/SegmentedControl.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatTile } from '../../components/ui/StatTile.jsx';
import { TextInput } from '../../components/ui/TextInput.jsx';
import { Toggle } from '../../components/ui/Toggle.jsx';
import { Icon } from '../../components/icons/Icon.jsx';
import { GallerySection } from './GallerySection.jsx';

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
];

export function PrimitivesGallery() {
  const [type, setType] = useState('all');
  const [amount, setAmount] = useState(32400);
  const [account, setAccount] = useState('');
  const [alerts, setAlerts] = useState(true);
  const [remember, setRemember] = useState(false);
  const [chips, setChips] = useState(['Food', 'Transport', 'Utilities']);

  return (
    <>
      <GallerySection title="Stat cards and tiles">
        <div className="w-72">
          <StatCard label="Total balance" value="RWF 412,500" icon={<Icon name="wallet" />} delta={{ value: 12.4, unit: '%' }} />
        </div>
        <div className="w-72">
          <StatCard label="Expenses" value="RWF 217,600" icon={<Icon name="expense" />} delta={{ value: 8.1, unit: '%' }} goodWhen="down" />
        </div>
        <StatTile label="Income" value="RWF 730,000" tone="success" />
        <StatTile label="Expenses" value="RWF 217,600" tone="accent" />
        <StatTile label="Net" value="RWF 512,400" />
      </GallerySection>

      <GallerySection title="Progress">
        <div className="flex w-80 flex-col gap-4">
          <ProgressBar value={68} />
          <ProgressBar value={41} tone="accent" />
          <ProgressBar value={120} tone="danger" />
          <LabeledProgress label="Bank of Kigali" right="RWF 196,200 · 48%" value={48} max={100} />
        </div>
      </GallerySection>

      <GallerySection title="Pills, badges, chips, money">
        <CategoryPill name="Food" color="orange" />
        <CategoryPill name="Transport" color="amber" />
        <CategoryPill name="Salary" color="green" />
        <Badge tone="success">On track</Badge>
        <Badge tone="warning">Near limit</Badge>
        <Badge tone="danger">Over budget</Badge>
        <Badge tone="accent">+ 8.2%</Badge>
        <Badge>Neutral</Badge>
        {chips.map((name) => (
          <Chip key={name} label={name} onRemove={() => setChips(chips.filter((chip) => chip !== name))} />
        ))}
        <Money amount={412500} className="font-heading text-xl font-bold" />
        <Money amount={690000} compact />
        <Money amount={-32400} signed />
      </GallerySection>

      <GallerySection title="Lists and empty states">
        <div className="w-96">
          <ListRow icon="income" iconTone="success" title="Salary" subtitle="Bank of Kigali · Sep 20, 2026" right={<span className="font-bold text-success">+650,000</span>} />
          <ListRow icon="home" title="Rent" subtitle="Due in 2 days" subtitleTone="warning" right={<Money amount={150000} />} />
        </div>
        <div className="w-60">
          <AddTile label="Add account" onClick={() => {}} />
        </div>
        <div className="w-96 rounded-card border border-line">
          <EmptyState title="No accounts yet" message="Add your MoMo, bank or cash wallet to start tracking." action={{ label: 'Add account', onClick: () => {} }} />
        </div>
      </GallerySection>

      <GallerySection title="Form controls">
        <div className="flex w-80 flex-col gap-4">
          <FormField label="Description" htmlFor="g-desc">
            <TextInput id="g-desc" placeholder="e.g. Groceries at Simba" />
          </FormField>
          <FormField label="Name" htmlFor="g-name" error="Enter a name">
            <TextInput id="g-name" error="Enter a name" />
          </FormField>
          <FormField label="Password" htmlFor="g-pw">
            <PasswordInput id="g-pw" placeholder="Enter your password" />
          </FormField>
          <FormField label="Amount (RWF)" htmlFor="g-amount">
            <AmountInput id="g-amount" value={amount} onChange={setAmount} />
          </FormField>
          <FormField label="Account" htmlFor="g-account">
            <Select
              id="g-account"
              placeholder="Choose an account"
              value={account}
              onChange={setAccount}
              options={[
                { value: '1', label: 'MTN MoMo' },
                { value: '2', label: 'Bank of Kigali' },
              ]}
            />
          </FormField>
          <Checkbox id="g-remember" checked={remember} onChange={setRemember} label="Keep me logged in" />
        </div>
        <div className="flex w-80 flex-col gap-4">
          <SegmentedControl options={TYPES} value={type} onChange={setType} label="Type" />
          <SegmentedControl options={TYPES.slice(1)} value={type} onChange={setType} variant="accent" fullWidth label="Type" />
          <SegmentedControl options={[{ value: 'login', label: 'Log in' }, { value: 'register', label: 'Sign up' }]} value="login" onChange={() => {}} variant="pill" size="lg" fullWidth label="Account" />
          <Select variant="filter" label="Category" placeholder="All categories" value="" onChange={() => {}} options={[{ value: '1', label: 'Food' }]} />
          <Toggle label="Budget alerts" description="Warn me at 90% of a budget" checked={alerts} onChange={setAlerts} />
        </div>
      </GallerySection>
    </>
  );
}
```

**Check (tasks 1 and 2):** ☐ every component in the gallery looks like its mockup ☐ Tab moves through every control with a visible orange focus ring ☐ the eye button shows/hides the password ☐ typing letters into the amount does nothing, digits get separators when you leave the field ☐ no console errors


### Task 3 — Landing page

Open `mockups/ikofi-landing.html` next to your editor. The page is built from eight **sections**, each its own component in `client/src/features/landing/`, assembled by `LandingPage`. Small components are easier to read, review and change than one 400-line file.

**Making it responsive.** The mockup is 1440px wide only. The rule is to write the phone layout first (no prefix), then add `md:` / `lg:` classes for bigger screens. For example, `px-4 md:px-8 lg:px-24` means 16px of side padding on phones, 32px on tablets, and the mockup's 96px on laptops. Two-column layouts are `grid lg:grid-cols-2`: one column on phones, two from 1024px.

**Animations.** `animate-up` slides an element in. `style={{ animationDelay: '.2s' }}` makes it start a bit later, so items appear one after another. All animations switch off automatically when someone turns on "reduce motion" in their OS (Tresor's global CSS does that).

**Links.** Links to other pages of the app use React Router's `<Link to="/register">`: the page changes without reloading the whole app. Links to a section of the same page (`#features`) use a normal `<a href>`.

**LandingNav:** logo, the section links (hidden on small screens, where there is no room), and the two buttons. `as={Link}` makes `Button` render a link that looks like a button.

**`client/src/features/landing/LandingNav.jsx`**
```jsx
import { Link } from 'react-router-dom';
import { Logo } from '../../components/layout/Logo.jsx';
import { Button } from '../../components/ui/Button.jsx';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export function LandingNav() {
  return (
    <header className="relative flex animate-up items-center justify-between gap-4 px-4 py-6 md:px-8 lg:px-24 lg:py-7">
      <Logo />
      <nav aria-label="Sections" className="hidden gap-2 rounded-pill border border-line bg-surface/70 p-1.5 text-[15px] font-semibold lg:flex">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="rounded-pill px-[18px] py-2.5 text-ink-secondary transition-colors hover:bg-line hover:text-ink">
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-1 md:gap-2.5">
        <Link to="/login" className="px-3 py-3 text-[15px] font-bold text-ink hover:text-accent-hover md:px-5">
          Log in
        </Link>
        <Button as={Link} to="/register">
          Get started
        </Button>
      </div>
    </header>
  );
}
```

**Hero:** the headline on the left and the floating "app preview" on the right. The preview has four pieces placed with `absolute` positions on large screens. On phones there's no room for floating cards, so only the activity card shows (`hidden lg:flex` hides the others below 1024px). The data arrays at the top hold the mockup's sample numbers.

**`client/src/features/landing/Hero.jsx`**
```jsx
import { Link } from 'react-router-dom';
import { Gauge } from '../../components/charts/Gauge.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';

const WEEK = [
  { day: 'Mon', height: 42 },
  { day: 'Tue', height: 82, highlight: true },
  { day: 'Wed', height: 55 },
  { day: 'Thu', height: 64 },
  { day: 'Fri', height: 30 },
  { day: 'Sat', height: 48 },
  { day: 'Sun', height: 58 },
];

function ActivityCard() {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-[18px] rounded-card border border-line bg-surface p-[26px] lg:absolute lg:left-0 lg:top-10">
      <div className="flex items-center justify-between">
        <span className="font-semibold">My activity</span>
        <span className="text-[13px] text-ink-muted">This week</span>
      </div>
      <div className="flex h-[180px] items-end gap-3" aria-hidden="true">
        {WEEK.map((bar, i) => (
          <div key={bar.day} className="flex h-full flex-1 items-end rounded-field bg-track">
            <div
              className={`w-full origin-bottom animate-grow rounded-field ${bar.highlight ? 'bg-accent-gradient-v' : 'bg-bar-muted'}`}
              style={{ height: `${bar.height}%`, animationDelay: `${0.6 + i * 0.1}s` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-ink-muted">
        {WEEK.map((bar) => (
          <span key={bar.day}>{bar.day}</span>
        ))}
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative flex animate-up justify-center lg:block lg:h-[560px]" style={{ animationDelay: '.35s' }} aria-hidden="true">
      <ActivityCard />

      <div className="absolute right-2.5 top-0 hidden h-[200px] w-[330px] animate-float flex-col justify-between rounded-[22px] border border-[#8C5A40] bg-card-momo p-[26px] shadow-[0_30px_60px_rgba(0,0,0,.45)] lg:flex">
        <div className="flex justify-between text-[15px] font-semibold">
          <span>Ikofi Card</span>
          <span className="text-accent-gold">VISA</span>
        </div>
        <div className="font-heading text-[22px] tracking-[0.08em]">•••• •••• •••• 0329</div>
        <div className="flex justify-between text-xs text-[#E6D6CB]">
          <span>IKOFI MEMBER</span>
          <span>10/28</span>
        </div>
      </div>

      <div className="absolute right-0 top-[250px] hidden w-[300px] animate-floaty flex-col items-center gap-1.5 rounded-card border border-line bg-surface p-6 lg:flex">
        <span className="self-start font-semibold">Budget used</span>
        <Gauge value={186000} max={300000} caption="RWF 186,000 of 300,000" />
      </div>

      <div
        className="absolute bottom-0 left-[60px] hidden w-[330px] animate-up flex-col gap-3 rounded-[22px] border border-line bg-surface px-6 py-[22px] shadow-[0_24px_48px_rgba(0,0,0,.4)] lg:flex"
        style={{ animationDelay: '.8s' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-ink-muted">Total saving</span>
            <span className="font-heading text-[28px] font-bold">RWF 420,000</span>
          </div>
          <Badge tone="success">+ 8.2%</Badge>
        </div>
        <ProgressBar value={70} delay={1.1} />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative grid items-center gap-12 px-4 pb-20 pt-10 md:px-8 lg:grid-cols-2 lg:px-24 lg:pb-24 lg:pt-[72px]">
      <div className="flex flex-col gap-[30px]">
        <div
          className="flex w-fit animate-up items-center gap-2.5 rounded-pill border border-line bg-surface-alt py-2 pl-2.5 pr-4 text-sm font-semibold text-ink-soft"
          style={{ animationDelay: '.1s' }}
        >
          <span className="h-2 w-2 animate-pulse-ring rounded-full bg-accent" />
          Personal money management, made simple
        </div>
        <h1
          className="animate-up font-heading text-[44px] font-bold leading-[1.02] tracking-[-0.035em] md:text-6xl lg:text-[76px]"
          style={{ animationDelay: '.2s' }}
        >
          Your money,
          <br />
          <span className="bg-accent-gradient bg-clip-text text-transparent">finally in focus.</span>
        </h1>
        <p className="max-w-[520px] animate-up text-lg leading-relaxed text-ink-secondary md:text-xl" style={{ animationDelay: '.3s' }}>
          Track income and spending across mobile money, bank and cash. Set budgets that hold, and grow savings toward the goals that matter.
        </p>
        <div className="flex animate-up flex-wrap gap-3.5" style={{ animationDelay: '.4s' }}>
          <Button as={Link} to="/register" size="lg">
            Create free account
          </Button>
          <Button as="a" href="#how" variant="outline" size="lg">
            See how it works
          </Button>
        </div>
      </div>
      <HeroVisual />
    </section>
  );
}
```

**Marquee:** the scrolling strip of words. The trick is to put the list in **twice** and slide the whole row left by half its width, forever; when the first copy has scrolled out, the second sits exactly where the first started, so the loop is seamless. Screen readers get the list once, as plain text (`sr-only` hides it visually).

**`client/src/features/landing/Marquee.jsx`**
```jsx
import { Fragment } from 'react';

const ITEMS = ['Mobile money', 'Bank accounts', 'Cash', 'Budgets', 'Savings goals', 'Monthly reports'];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-line py-[26px]">
      <p className="sr-only">{ITEMS.join(', ')}</p>
      <div className="flex w-max animate-marquee gap-14 whitespace-nowrap font-heading text-xl font-semibold text-ink-dim" aria-hidden="true">
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {ITEMS.map((item) => (
              <Fragment key={item}>
                <span>{item}</span>
                <span className="text-accent">✦</span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
```

**FeatureGrid:** five feature cards. The first spans two columns on large screens (`lg:col-span-2`). Repeated small pieces (the uppercase eyebrow label, the card frame) are little components at the top of the file.

**`client/src/features/landing/FeatureGrid.jsx`**
```jsx
import clsx from 'clsx';
import { CategoryPill } from '../../components/ui/CategoryPill.jsx';
import { Icon } from '../../components/icons/Icon.jsx';
import { LabeledProgress } from '../../components/ui/LabeledProgress.jsx';

function Eyebrow({ children }) {
  return <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-accent">{children}</div>;
}

function FeatureCard({ className, children }) {
  return <div className={clsx('lift flex flex-col gap-3 rounded-hero border border-line bg-surface p-8', className)}>{children}</div>;
}

const SAMPLE_ROWS = [
  { name: 'Salary', category: 'Income', color: 'green', amount: '+650,000' },
  { name: 'Groceries', category: 'Food', color: 'orange', amount: '−32,400' },
  { name: 'Airtime', category: 'Utilities', color: 'yellow', amount: '−5,000' },
];
const REPORT_BARS = [40, 70, 55, 100, 62];

export function FeatureGrid() {
  return (
    <section id="features" className="flex scroll-mt-6 flex-col gap-14 px-4 pb-24 pt-20 md:px-8 lg:px-24 lg:pt-[120px]">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-12">
        <h2 className="max-w-[640px] font-heading text-4xl font-bold leading-[1.08] tracking-[-0.03em] lg:text-[52px]">
          Everything you need to master your money
        </h2>
        <p className="max-w-[400px] text-lg leading-relaxed text-ink-secondary">
          One calm, focused workspace instead of scattered notes and spreadsheets.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <FeatureCard className="grid gap-8 md:grid-cols-2 lg:col-span-2">
          <div className="flex flex-col gap-3">
            <Eyebrow>Transactions</Eyebrow>
            <h3 className="font-heading text-[28px] font-semibold leading-tight">Every franc, accounted for</h3>
            <p className="leading-relaxed text-ink-secondary">Log income and expenses in seconds and see them sorted by category and account.</p>
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            {SAMPLE_ROWS.map((row) => (
              <div key={row.name} className="flex items-center justify-between rounded-input bg-surface-raised px-4 py-3.5">
                <span>{row.name}</span>
                <CategoryPill name={row.category} color={row.color} />
                <span className="font-bold">{row.amount}</span>
              </div>
            ))}
          </div>
        </FeatureCard>

        <FeatureCard>
          <Eyebrow>Budgets</Eyebrow>
          <h3 className="font-heading text-[26px] font-semibold leading-tight">Limits that keep you on track</h3>
          <div className="mt-auto flex flex-col gap-3.5 pt-4">
            <LabeledProgress label="Transport" right="41%" value={41} max={100} tone="accent" />
            <LabeledProgress label="Food" right="68%" value={68} max={100} delay={0.2} />
          </div>
        </FeatureCard>

        <FeatureCard>
          <Eyebrow>Savings goals</Eyebrow>
          <h3 className="font-heading text-[26px] font-semibold leading-tight">Watch your goals fill up</h3>
          <p className="leading-relaxed text-ink-secondary">Set a target and a deadline for anything, from a laptop to school fees.</p>
        </FeatureCard>

        <FeatureCard>
          <Eyebrow>Reports</Eyebrow>
          <h3 className="font-heading text-[26px] font-semibold leading-tight">See the month at a glance</h3>
          <div className="mt-auto flex h-[90px] items-end gap-2.5 pt-4" aria-hidden="true">
            {REPORT_BARS.map((height, i) => (
              <div
                key={i}
                className={clsx('flex-1 origin-bottom animate-grow rounded-lg', height === 100 ? 'bg-accent-gradient-v' : 'bg-bar-muted')}
                style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </FeatureCard>

        <FeatureCard className="border-[#3A2A22] bg-[linear-gradient(160deg,#3A2419,#1E1B19_60%)]">
          <Icon name="lock" size={36} className="text-accent" />
          <h3 className="font-heading text-[26px] font-semibold leading-tight">Private by design</h3>
          <p className="leading-relaxed text-ink-secondary">Your data stays in your account behind a secure login.</p>
        </FeatureCard>
      </div>
    </section>
  );
}
```

**Steps:** three numbered cards. The data lives in an array and `map` draws one card per item, so a fourth step would be one more line of data, not another copy of the markup.

**`client/src/features/landing/Steps.jsx`**
```jsx
const STEPS = [
  { number: '01', color: 'bg-accent', title: 'Create your account', text: 'Sign up and add the wallets you use: mobile money, bank or cash.' },
  { number: '02', color: 'bg-accent-mid', title: 'Record your money', text: 'Add income and expenses as they happen, grouped by category.' },
  { number: '03', color: 'bg-accent-gold', title: 'Plan and grow', text: 'Set budgets and goals, then use reports to adjust each month.' },
];

export function Steps() {
  return (
    <section id="how" className="flex scroll-mt-6 flex-col gap-14 px-4 py-20 md:px-8 lg:p-24">
      <h2 className="font-heading text-4xl font-bold tracking-[-0.03em] lg:text-[52px]">Up and running in three steps</h2>
      <ol className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.number} className="lift flex flex-col gap-3.5 rounded-hero border border-line p-8">
            <span className={`grid h-[52px] w-[52px] place-items-center rounded-tile font-heading text-xl font-bold text-ink-onAccent ${step.color}`}>
              {step.number}
            </span>
            <h3 className="text-[22px] font-bold">{step.title}</h3>
            <p className="leading-relaxed text-ink-secondary">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

**About:** the two paragraphs are placeholders in the mockup ("[Your story…]"). Ask Tresor for the real text, or write it together.

**`client/src/features/landing/About.jsx`**
```jsx
export function About() {
  return (
    <section id="about" className="grid scroll-mt-6 items-start gap-8 px-4 py-20 md:px-8 lg:grid-cols-2 lg:gap-16 lg:p-24">
      <div className="flex flex-col gap-4">
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-accent">About us</div>
        <h2 className="font-heading text-4xl font-bold leading-[1.1] tracking-[-0.03em] lg:text-5xl">Built in Kigali for everyday money decisions</h2>
      </div>
      <div className="flex flex-col gap-[18px] text-lg leading-[1.7] text-ink-secondary lg:pt-9">
        <p>[Our story: why we built Ikofi and who it is for.]</p>
        <p>[Our mission: e.g. helping students and young professionals build lasting money habits.]</p>
      </div>
    </section>
  );
}
```

**CtaBanner:** the big "Take control of your money today" box with the orange glow.

**`client/src/features/landing/CtaBanner.jsx`**
```jsx
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';

export function CtaBanner() {
  return (
    <section className="px-4 pb-24 pt-12 md:px-8 lg:px-24">
      <div className="relative flex flex-col items-center gap-7 overflow-hidden rounded-cta border border-line bg-surface px-6 py-16 text-center lg:px-16 lg:py-[88px]">
        <div
          className="pointer-events-none absolute -bottom-[300px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 animate-glow rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(242,106,46,.45) 0%, rgba(242,106,46,0) 65%)' }}
        />
        <h2 className="relative max-w-[820px] font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] lg:text-6xl">
          Take control of your money today
        </h2>
        <p className="relative text-lg text-ink-secondary">Free to start. No card required.</p>
        <Button as={Link} to="/register" size="lg" className="relative">
          Get started
        </Button>
      </div>
    </section>
  );
}
```

**Footer.** The contact email is a placeholder; ask Tresor which address to use.

**`client/src/features/landing/Footer.jsx`**
```jsx
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      id="contact"
      className="mt-auto flex flex-col items-start gap-4 border-t border-line px-4 py-10 text-[15px] text-ink-muted md:flex-row md:items-center md:justify-between md:px-8 lg:px-24"
    >
      <span className="font-heading text-xl font-bold text-ink">Ikofi</span>
      <div className="flex flex-wrap gap-x-7 gap-y-2">
        <a href="mailto:hello@ikofi.app" className="hover:text-ink">
          hello@ikofi.app
        </a>
        <span>Kigali, Rwanda</span>
        <Link to="/privacy" className="hover:text-ink">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-ink">
          Terms
        </Link>
      </div>
      <span>© {new Date().getFullYear()} Ikofi</span>
    </footer>
  );
}
```

**LandingPage** puts the sections together. `overflow-hidden` stops the big glow circle from creating sideways scrolling.

**`client/src/pages/public/LandingPage.jsx`** (replaces Tresor's stub)
```jsx
import { About } from '../../features/landing/About.jsx';
import { CtaBanner } from '../../features/landing/CtaBanner.jsx';
import { FeatureGrid } from '../../features/landing/FeatureGrid.jsx';
import { Footer } from '../../features/landing/Footer.jsx';
import { Hero } from '../../features/landing/Hero.jsx';
import { LandingNav } from '../../features/landing/LandingNav.jsx';
import { Marquee } from '../../features/landing/Marquee.jsx';
import { Steps } from '../../features/landing/Steps.jsx';

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute -right-[120px] -top-[220px] h-[760px] w-[760px] animate-glow rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(242,106,46,.38) 0%, rgba(242,106,46,0) 65%)' }}
        aria-hidden="true"
      />
      <LandingNav />
      <main>
        <Hero />
        <Marquee />
        <FeatureGrid />
        <Steps />
        <About />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
```

### Task 4 — Privacy, Terms and Not found

Both legal pages share one layout component, so they look the same and the text is just data. **The text below is a starting draft, not legal advice.** Tresor should review it before launch.

**`client/src/pages/public/LegalPages.jsx`** (replaces Tresor's stub)
```jsx
import { Logo } from '../../components/layout/Logo.jsx';

function LegalPage({ title, updated, sections }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Logo />
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-bold tracking-[-0.03em]">{title}</h1>
          <p className="text-sm text-ink-muted">Last updated {updated}</p>
        </header>
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text} className="leading-relaxed text-ink-secondary">
                {text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

const PRIVACY = [
  {
    heading: 'What we store',
    paragraphs: [
      'Your name, email address and password (stored only as a secure hash), and the money records you enter: accounts, transactions, budgets, goals and bills. Optionally a phone number, city and profile photo.',
    ],
  },
  {
    heading: 'How we use it',
    paragraphs: [
      'Only to run Ikofi for you: showing your balances and reports, sending the emails you ask for (password reset, weekly summary) and keeping your account secure. We do not sell your data or show you ads.',
    ],
  },
  {
    heading: 'Who can see it',
    paragraphs: [
      'Only you. Administrators can see that your account exists and whether it is active, but not your amounts or transactions.',
    ],
  },
  {
    heading: 'Deleting your data',
    paragraphs: ['Settings → Delete account removes your account and every record linked to it, permanently.'],
  },
];

const TERMS = [
  {
    heading: 'Using Ikofi',
    paragraphs: [
      'Ikofi helps you record and plan your money. It does not move real money and is not a bank. You are responsible for the accuracy of what you enter.',
    ],
  },
  {
    heading: 'Your account',
    paragraphs: ['Keep your password private. We may suspend accounts that abuse the service or try to access other people’s data.'],
  },
  {
    heading: 'No warranty',
    paragraphs: ['Ikofi is provided as is. Figures are only as accurate as the records they are calculated from.'],
  },
];

export function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="2026" sections={PRIVACY} />;
}

export function TermsPage() {
  return <LegalPage title="Terms of use" updated="2026" sections={TERMS} />;
}
```

**`client/src/pages/public/NotFoundPage.jsx`** (replaces Tresor's stub)
```jsx
import { Link } from 'react-router-dom';
import { Logo } from '../../components/layout/Logo.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center">
      <Logo />
      <p className="bg-accent-gradient bg-clip-text font-heading text-[96px] font-bold leading-none text-transparent">404</p>
      <h1 className="font-heading text-3xl font-bold">This page does not exist</h1>
      <p className="max-w-md text-ink-secondary">The link may be broken, or the page may have moved.</p>
      <Button as={Link} to="/">
        Back to home
      </Button>
    </main>
  );
}
```

**Check (tasks 3 and 4):** ☐ landing matches the mockup at 1440px wide ☐ no sideways scrolling at 375px and 768px (DevTools → toggle device toolbar) ☐ "Features / How it works / About / Contact" scroll to their sections ☐ "Get started" goes to `/register`, "Log in" to `/login` ☐ with "reduce motion" on (Windows: Settings → Accessibility → Visual effects → Animation effects off) nothing moves ☐ `/privacy`, `/terms` and a made-up URL like `/nope` show the right pages

---


## Phase 2 — Login and sign-up screens

**Wait for:** Tresor's Phase 2 (`AuthContext`, the route guards, `AppShell`).

**Goal:** the page from `mockups/ikofi-login.html`, working for real: log in, sign up, see errors.

**How login works (what Tresor built):** `useAuth()` gives you `login({ email, password, remember })` and `register({ full_name, email, password })`. Each one calls the API, which sets a secure cookie. If it fails, it **throws** an `ApiError` with `status`, `code`, `message` and `fields`. When login succeeds, a **route guard** notices you're logged in and sends you to `/dashboard` (or `/admin`, or back to the page you came from). Your page never has to redirect.

**ArtPanel** is the decorative right half of the screen: a floating card, a mini chart, a "goal reached" toast and the headline. It's purely visual, so `aria-hidden` hides it from screen readers.

**`client/src/components/layout/ArtPanel.jsx`**
```jsx
import { Icon } from '../icons/Icon.jsx';
import { Badge } from '../ui/Badge.jsx';

const BARS = [45, 90, 58, 70, 36];

export function ArtPanel() {
  return (
    <div className="relative hidden overflow-hidden rounded-[32px] border border-line bg-surface-alt lg:block" aria-hidden="true">
      <div
        className="absolute left-1/2 top-[120px] h-[760px] w-[760px] -translate-x-1/2 animate-glow rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(242,106,46,.42) 0%, rgba(242,106,46,0) 62%)' }}
      />

      <div className="absolute left-[90px] top-[110px] flex h-[206px] w-[340px] animate-float flex-col justify-between rounded-[22px] border border-[#8C5A40] bg-card-momo p-[26px] shadow-[0_30px_60px_rgba(0,0,0,.5)]">
        <div className="flex justify-between text-[15px] font-semibold">
          <span>Ikofi Card</span>
          <span className="text-accent-gold">VISA</span>
        </div>
        <div className="font-heading text-[22px] tracking-[0.08em]">•••• •••• •••• 0329</div>
        <div className="flex justify-between text-xs text-[#E6D6CB]">
          <span>IKOFI MEMBER</span>
          <span>10/28</span>
        </div>
      </div>

      <div className="absolute right-[70px] top-[250px] flex w-[250px] animate-floaty flex-col gap-3.5 rounded-[22px] border border-line-strong bg-surface/90 p-[22px] shadow-float">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">This week</span>
          <Badge tone="success">+ 8.2%</Badge>
        </div>
        <div className="flex h-24 items-end gap-2">
          {BARS.map((height, i) => (
            <div
              key={i}
              className={`flex-1 origin-bottom animate-grow rounded-lg ${i === 1 ? 'bg-accent-gradient-v' : 'bg-bar-muted'}`}
              style={{ height: `${height}%`, animationDelay: `${0.4 + i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute left-[130px] top-[420px] flex w-[300px] animate-up items-center gap-3.5 rounded-[20px] border border-line-strong bg-surface/90 px-[22px] py-5 shadow-float"
        style={{ animationDelay: '.6s' }}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-tint text-accent-soft">
          <Icon name="coin" size={22} />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-ink-muted">Savings goal reached</span>
          <span className="font-bold">New laptop · 100%</span>
        </div>
      </div>

      <div className="absolute bottom-14 left-16 right-16 flex flex-col gap-3.5">
        <h2 className="font-heading text-[40px] font-bold leading-[1.1] tracking-[-0.03em]">
          Every franc,
          <br />
          <span className="bg-accent-gradient bg-clip-text text-transparent">in one calm place.</span>
        </h2>
        <p className="max-w-[460px] text-[17px] leading-relaxed text-ink-secondary">
          Mobile money, bank and cash, tracked together with budgets and goals that keep you moving forward.
        </p>
      </div>
    </div>
  );
}
```

**AuthLayout** is the frame shared by login, sign-up and (later) the password reset pages: logo at the top, the form in the middle, links at the bottom, and the art panel on the right from 1024px up. Whatever you put between `<AuthLayout>` and `</AuthLayout>` arrives as `children`.

**`client/src/components/layout/AuthLayout.jsx`**
```jsx
import { Link } from 'react-router-dom';
import { ArtPanel } from './ArtPanel.jsx';
import { Logo } from './Logo.jsx';

export function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen gap-5 bg-bg p-3 md:p-5 lg:grid-cols-2">
      <div className="flex flex-col px-3 py-6 md:px-10 lg:px-[88px] lg:py-9">
        <div className="animate-up">
          <Logo />
        </div>
        <main className="my-auto w-full max-w-[440px] py-10">{children}</main>
        <footer className="flex justify-between text-[13px] text-ink-faint">
          <span>© {new Date().getFullYear()} Ikofi</span>
          <nav className="flex gap-5">
            <Link to="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink">
              Terms
            </Link>
          </nav>
        </footer>
      </div>
      <ArtPanel />
    </div>
  );
}
```

**AuthPage** is one component for both `/login` and `/register`, because they share almost everything; `mode` says which one. Read it top to bottom:
1. `values` holds what's typed; `set('email')` returns a function that updates one field.
2. `handleSubmit` stops the browser's normal form submission (`preventDefault`), calls `login` or `register`, and on failure stores the error.
3. Errors show in two places: `error.fields` under each input (e.g. "This email is already registered"), and `error.message` above the button when it isn't about one field (wrong password, suspended account, too many attempts, server unreachable).
4. The Log in / Sign up switch changes the URL; `state: location.state` keeps the "where to go after login" information.

**`client/src/pages/auth/AuthPage.jsx`** (replaces Tresor's stub)
```jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Icon } from '../../components/icons/Icon.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Checkbox } from '../../components/ui/Checkbox.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput.jsx';
import { SegmentedControl } from '../../components/ui/SegmentedControl.jsx';
import { TextInput } from '../../components/ui/TextInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const MODES = [
  { value: 'login', label: 'Log in' },
  { value: 'register', label: 'Sign up' },
];

const COPY = {
  login: { title: 'Welcome back', subtitle: 'Log in to see your balance, budgets and goals.', button: 'Log in' },
  register: { title: 'Create your account', subtitle: 'Start tracking your money in a minute. It’s free.', button: 'Create account' },
};

export function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ full_name: '', email: '', password: '', remember: false });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = COPY[mode];
  const fields = error?.fields ?? {};
  const set = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));

  function switchMode(next) {
    setError(null);
    navigate(next === 'login' ? '/login' : '/register', { replace: true, state: location.state });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: values.email, password: values.password, remember: values.remember });
      } else {
        await register({ full_name: values.full_name, email: values.email, password: values.password });
      }
      // Success: the route guard redirects, nothing else to do here.
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[22px]">
        <div className="flex animate-up flex-col gap-2.5" style={{ animationDelay: '.1s' }}>
          <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] md:text-[44px]">{copy.title}</h1>
          <p className="text-[17px] text-ink-secondary">{copy.subtitle}</p>
        </div>

        <div className="animate-up" style={{ animationDelay: '.18s' }}>
          <SegmentedControl options={MODES} value={mode} onChange={switchMode} variant="pill" size="lg" fullWidth label="Log in or sign up" />
        </div>

        {mode === 'register' && (
          <FormField label="Full name" htmlFor="full_name" error={fields.full_name}>
            <TextInput
              id="full_name"
              size="lg"
              autoComplete="name"
              placeholder="Your full name"
              value={values.full_name}
              onChange={(e) => set('full_name')(e.target.value)}
              error={fields.full_name}
            />
          </FormField>
        )}

        <div className="animate-up" style={{ animationDelay: '.26s' }}>
          <FormField label="Email" htmlFor="email" error={fields.email}>
            <TextInput
              id="email"
              type="email"
              size="lg"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => set('email')(e.target.value)}
              error={fields.email}
            />
          </FormField>
        </div>

        <div className="animate-up" style={{ animationDelay: '.34s' }}>
          <FormField
            label="Password"
            htmlFor="password"
            error={fields.password}
            hint={mode === 'register' ? 'At least 8 characters' : undefined}
            labelRight={
              mode === 'login' && (
                <Link to="/forgot-password" className="text-sm font-semibold text-accent-hover hover:text-accent-gold">
                  Forgot password?
                </Link>
              )
            }
          >
            <PasswordInput
              id="password"
              size="lg"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder={mode === 'login' ? 'Enter your password' : 'Choose a password'}
              value={values.password}
              onChange={(e) => set('password')(e.target.value)}
              error={fields.password}
            />
          </FormField>
        </div>

        {mode === 'login' && (
          <div className="animate-up" style={{ animationDelay: '.42s' }}>
            <Checkbox id="remember" checked={values.remember} onChange={set('remember')} label="Keep me logged in" />
          </div>
        )}

        {error && !error.fields && (
          <p role="alert" className="rounded-field border border-danger-line bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">
            {error.message}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} iconRight={<Icon name="arrowRight" size={18} strokeWidth={2.2} />}>
          {copy.button}
        </Button>

        <p className="text-center text-[15px] text-ink-muted">
          {mode === 'login' ? 'New to Ikofi? ' : 'Already have an account? '}
          <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="font-bold text-accent-hover hover:text-accent-gold">
            {mode === 'login' ? 'Create a free account' : 'Log in'}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
```

Nothing to change in the router: Tresor already points `/login` and `/register` at `AuthPage`.

**Check:** ☐ `demo@ikofi.test` / `demo-password` lands on `/dashboard` ☐ the admin from `.env` (`SEED_ADMIN_EMAIL`) lands on `/admin` ☐ a wrong password shows "Email or password is incorrect" ☐ signing up with an existing email shows "This email is already registered" under the email field ☐ a 3-letter password shows an error under the password field ☐ "Keep me logged in" ticked → close and reopen the browser, still logged in ☐ the art panel disappears below 1024px wide

---


## Phase 3 — Accounts (your first full-stack feature)

**Wait for:** Tresor's Phase 3: Categories, `models/accounts.js` with `findActive` and `adjustBalance`, and `docs/crud-recipe.md`.

**Goal:** the Accounts page from `mockups/ikofi-accounts.html`, working end to end. Users add their wallets (MTN MoMo, Bank of Kigali, Cash), rename them, delete them, and see the total. Transfers and the activity list come later (Phase 6).

**Read first:** `docs/crud-recipe.md`, and open Tresor's Categories files. Accounts follows exactly the same shape, so each file below has a "twin" in Categories.

**What the API must do (the contract):**

| Endpoint | Request | Response | Rule |
|---|---|---|---|
| `GET /api/accounts` | — | `{ data: Account[], meta: { total_balance } }` | Only my accounts that are not archived |
| `GET /api/accounts/:id` | — | `{ data: Account }` | 404 if not mine |
| `POST /api/accounts` | `{ name, type, opening_balance?, account_number_last4? }` | `201 { data: Account }` | The balance starts at `opening_balance` |
| `PATCH /api/accounts/:id` | any of `{ name, type, account_number_last4 }` | `{ data: Account }` | 404 if not mine. The balance can't be edited here |
| `DELETE /api/accounts/:id` | — | `{ data: { archived: true/false } }` | 404 if not mine. No history → really deleted; has history → archived (hidden) |

`Account` looks like `{ id, name, type, balance, account_number_last4, updated_at }`. `type` is `cash`, `bank` or `mobile_money`.

**Why archive instead of delete?** Transactions point at their account. Deleting an account that has transactions would break those records (the database refuses anyway: `ON DELETE RESTRICT`). So an account with history is *archived*: hidden everywhere, history intact.

### Pull request 1 — the API

**1. Validator.** It describes what a valid request looks like. zod checks the body; anything wrong becomes a 422 with a message per field, before your code even runs. `trim()` removes spaces around the name; `.nullable()` allows `null` ("no number"); `.default(...)` fills in a value when the field is missing.

**`backend/src/validators/accounts.js`**
```js
import { z } from 'zod';

const name = z.string().trim().min(1, 'Enter a name').max(40, 'At most 40 characters');
const type = z.enum(['cash', 'bank', 'mobile_money'], {
  errorMap: () => ({ message: 'Choose an account type' }),
});
const last4 = z.string().regex(/^\d{4}$/, 'Exactly 4 digits').nullable();

export const createBody = z.object({
  name,
  type,
  opening_balance: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .min(0, 'Cannot be negative')
    .multipleOf(0.01, 'At most 2 decimal places')
    .max(999_999_999_999.99, 'Amount is too large')
    .default(0),
  account_number_last4: last4.default(null),
});

// Every field optional, but at least one must be sent.
export const updateBody = z
  .object({ name: name.optional(), type: type.optional(), account_number_last4: last4.optional() })
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update');
```

**2. Model.** The SQL. The file already has Tresor's `findActive` and `adjustBalance` at the top. **Don't change them**; add everything below them. Rules every function follows:
- one function = one SQL statement;
- `db` is passed in (the pool, or a transaction client), never imported;
- every query includes `user_id = $…`, so nobody can ever touch another person's account;
- values go in as `$1, $2…` parameters, **never** pasted into the SQL string (pasting is how SQL injection happens).

**`backend/src/models/accounts.js`** (add below the existing functions)
```js
// The columns sent to the browser
const COLUMNS = 'id, name, type, balance, account_number_last4, updated_at';

export async function listActive(db, userId) {
  const { rows } = await db.query(
    `SELECT ${COLUMNS}
     FROM accounts
     WHERE user_id = $1 AND is_archived = false
     ORDER BY created_at, id`,
    [userId],
  );
  return rows;
}

// The total is summed by PostgreSQL, never added up in JavaScript.
export async function totalBalance(db, userId) {
  const { rows } = await db.query(
    `SELECT COALESCE(SUM(balance), 0) AS total
     FROM accounts
     WHERE user_id = $1 AND is_archived = false`,
    [userId],
  );
  return rows[0].total;
}

export async function findOwn(db, userId, id) {
  const { rows } = await db.query(
    `SELECT ${COLUMNS} FROM accounts WHERE id = $1 AND user_id = $2 AND is_archived = false`,
    [id, userId],
  );
  return rows[0] ?? null;
}

// $4 is used twice: a new account's balance starts at its opening balance.
export async function create(db, userId, { name, type, opening_balance, account_number_last4 }) {
  const { rows } = await db.query(
    `INSERT INTO accounts (user_id, name, type, opening_balance, balance, account_number_last4)
     VALUES ($1, $2, $3, $4, $4, $5)
     RETURNING ${COLUMNS}`,
    [userId, name, type, opening_balance, account_number_last4],
  );
  return rows[0];
}

// COALESCE($3, name) means "the new name if one was sent, otherwise keep the old one".
// account_number_last4 can be *cleared* (set to null), so COALESCE can't tell "not sent" from
// "set to empty". $6 says whether it was sent at all.
export async function update(db, userId, id, changes) {
  const { rows } = await db.query(
    `UPDATE accounts
     SET name                 = COALESCE($3, name),
         type                 = COALESCE($4, type),
         account_number_last4 = CASE WHEN $6 THEN $5 ELSE account_number_last4 END,
         updated_at           = now()
     WHERE id = $1 AND user_id = $2 AND is_archived = false
     RETURNING ${COLUMNS}`,
    [id, userId, changes.name ?? null, changes.type ?? null, changes.account_number_last4 ?? null, 'account_number_last4' in changes],
  );
  return rows[0] ?? null; // null = not found (or not mine)
}

// Has anything ever moved money in or out of this account?
export async function hasHistory(db, id) {
  const { rows } = await db.query(
    `SELECT EXISTS (SELECT 1 FROM transactions WHERE account_id = $1)
         OR EXISTS (SELECT 1 FROM transfers WHERE from_account_id = $1 OR to_account_id = $1)
         OR EXISTS (SELECT 1 FROM goal_contributions WHERE account_id = $1) AS used`,
    [id],
  );
  return rows[0].used;
}

export async function remove(db, userId, id) {
  await db.query('DELETE FROM accounts WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function archive(db, userId, id) {
  await db.query(
    'UPDATE accounts SET is_archived = true, updated_at = now() WHERE id = $1 AND user_id = $2',
    [id, userId],
  );
}
```

**3. Service.** Most requests go straight from controller to model. Delete is different: it needs a *decision* (delete or archive?) and several queries, which is exactly when a service file exists. Compare it with `services/categories.js` `remove`.

**`backend/src/services/accounts.js`**
```js
import { pool } from '../db/pool.js';
import { notFound } from '../lib/AppError.js';
import * as accounts from '../models/accounts.js';

// Accounts with history are archived (hidden) so old transactions keep their account.
export async function remove(userId, id) {
  const account = await accounts.findOwn(pool, userId, id);
  if (!account) throw notFound('Account');

  if (await accounts.hasHistory(pool, id)) {
    await accounts.archive(pool, userId, id);
    return { archived: true };
  }
  await accounts.remove(pool, userId, id);
  return { archived: false };
}
```

**4. Controller.** It only translates HTTP into function calls and back: read `req.valid` and `req.user.id`, call the model or service, send `{ data }`. No SQL here. `throw notFound(...)` is enough for errors, because Tresor's error handler turns it into a proper 404 response. `Promise.all` runs the list and the total at the same time instead of one after the other.

**`backend/src/controllers/accounts.js`**
```js
import { pool } from '../db/pool.js';
import { notFound } from '../lib/AppError.js';
import * as accounts from '../models/accounts.js';
import * as accountsService from '../services/accounts.js';

export async function list(req, res) {
  const [rows, total] = await Promise.all([
    accounts.listActive(pool, req.user.id),
    accounts.totalBalance(pool, req.user.id),
  ]);
  res.json({ data: rows, meta: { total_balance: total } });
}

export async function get(req, res) {
  const account = await accounts.findOwn(pool, req.user.id, req.valid.params.id);
  if (!account) throw notFound('Account');
  res.json({ data: account });
}

export async function create(req, res) {
  const account = await accounts.create(pool, req.user.id, req.valid.body);
  res.status(201).json({ data: account });
}

export async function update(req, res) {
  const account = await accounts.update(pool, req.user.id, req.valid.params.id, req.valid.body);
  if (!account) throw notFound('Account');
  res.json({ data: account });
}

export async function remove(req, res) {
  res.json({ data: await accountsService.remove(req.user.id, req.valid.params.id) });
}
```

**5. Routes.** Each line is: method + path → validate the input → controller. `idParams` (from Tresor's `common.js`) checks that `:id` is a positive whole number.

**`backend/src/routes/accounts.js`**
```js
import { Router } from 'express';
import * as controller from '../controllers/accounts.js';
import { validate } from '../middleware/validate.js';
import { createBody, updateBody } from '../validators/accounts.js';
import { idParams } from '../validators/common.js';

export const accountsRouter = Router();

accountsRouter.get('/', controller.list);
accountsRouter.post('/', validate({ body: createBody }), controller.create);
accountsRouter.get('/:id', validate({ params: idParams }), controller.get);
accountsRouter.patch('/:id', validate({ params: idParams, body: updateBody }), controller.update);
accountsRouter.delete('/:id', validate({ params: idParams }), controller.remove);
```

**6. Mount it.** In `backend/src/routes/index.js`, add the import at the top and replace Tresor's commented line. `authenticate` in front means every accounts request needs a logged-in user and fills in `req.user`.
```js
import { accountsRouter } from './accounts.js';
// …
apiRouter.use('/accounts', authenticate, accountsRouter);
```

**7. Try it with the `.http` file.** Open it in VS Code; a "Send Request" link appears above each request. Run them top to bottom. The REST Client remembers the login cookie, like a browser. The last part proves the most important rule: **another user gets 404**.

**`backend/http/accounts.http`**
```http
@base = http://localhost:4000/api

### 1. Log in as the demo user
POST {{base}}/auth/login
Content-Type: application/json

{ "email": "demo@ikofi.test", "password": "demo-password" }

### 2. List my accounts (look at meta.total_balance)
GET {{base}}/accounts

### 3. Create one
POST {{base}}/accounts
Content-Type: application/json

{ "name": "Equity Bank", "type": "bank", "opening_balance": 50000, "account_number_last4": "4410" }

### 4. Read it (replace 4 with the id returned above)
GET {{base}}/accounts/4

### 5. Rename it and clear the number
PATCH {{base}}/accounts/4
Content-Type: application/json

{ "name": "Equity Savings", "account_number_last4": null }

### 6. Invalid input → 422 with a message per field
POST {{base}}/accounts
Content-Type: application/json

{ "name": "", "type": "crypto", "account_number_last4": "12" }

### 7. Delete it (no history → { "archived": false })
DELETE {{base}}/accounts/4

### 8. Delete MTN MoMo (has transactions → { "archived": true })
DELETE {{base}}/accounts/1

### ---- Owner check: become a different user ----

### 9. Register a second user (this logs you in as them).
###    Second time you run this file it answers 409; then log in as second@example.com instead.
POST {{base}}/auth/register
Content-Type: application/json

{ "full_name": "Second User", "email": "second@example.com", "password": "password123" }

### 10. The demo user's account must be invisible → 404
GET {{base}}/accounts/2

### 11. → 404
PATCH {{base}}/accounts/2
Content-Type: application/json

{ "name": "Not mine" }

### 12. → 404
DELETE {{base}}/accounts/2
```

Request 8 archives the demo user's MoMo account. To get it back, rebuild your database:
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS ikofi;" -c "CREATE DATABASE ikofi;"
npm run migrate && npm run seed:demo
```

**Check (PR 1):** ☐ requests 1–8 give the expected answers ☐ request 6 returns 422 with messages for `name`, `type` and `account_number_last4` ☐ requests 10–12 all return 404 ☐ `npm run check:balances` still passes

### Pull request 2 — the page

**1. API module.** One plain function per endpoint. `client` is Tresor's axios instance: it adds `/api` in front and unwraps the response to `{ data, meta }`.

**`client/src/api/accounts.js`**
```js
import { client } from './client.js';

export const listAccounts = () => client.get('/accounts');
export const createAccount = (body) => client.post('/accounts', body);
export const updateAccount = ({ id, ...body }) => client.patch(`/accounts/${id}`, body);
export const deleteAccount = (id) => client.delete(`/accounts/${id}`);
```

**2. Hooks.** React Query fetches the data, caches it, and refetches when it's out of date. Every component that needs accounts calls `useAccounts()`; only one request is made, and they all share the result.
- `useAccounts` and `useTotalBalance` share **one** cached request (same `queryKey`) and each `select` the part they need.
- After any change, `invalidateQueries` marks `accounts` and `dashboard` data as stale, so they refetch and every screen shows the new numbers.

**`client/src/hooks/useAccounts.js`**
```js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/accounts.js';

const accountsQuery = { queryKey: ['accounts'], queryFn: api.listAccounts };

// Account[]
export const useAccounts = () => useQuery({ ...accountsQuery, select: (response) => response.data });

// number
export const useTotalBalance = () => useQuery({ ...accountsQuery, select: (response) => response.meta.total_balance });

function useAccountMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  });
}

export const useCreateAccount = () => useAccountMutation(api.createAccount);
export const useUpdateAccount = () => useAccountMutation(api.updateAccount);
export const useDeleteAccount = () => useAccountMutation(api.deleteAccount);
```

**3. AccountCard.** The gradient card from the mockup. The gradient, border and label depend on the account type, so they live in one `LOOKS` object instead of `if`s scattered around. The edit and delete buttons call functions the **page** passes in (`onEdit`, `onDelete`); the card itself never talks to the API.

**`client/src/features/accounts/AccountCard.jsx`**
```jsx
import clsx from 'clsx';
import { Icon } from '../../components/icons/Icon.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Money } from '../../components/ui/Money.jsx';
import { formatShortDate, todayISO } from '../../lib/dates.js';

const LOOKS = {
  mobile_money: { card: 'bg-card-momo border-[#8C5A40]', label: 'Mobile money' },
  bank: { card: 'bg-card-bank border-[#4A4843]', label: 'Bank account' },
  cash: { card: 'bg-card-cash border-[#6A5428]', label: 'Cash in hand' },
};

// updated_at is a full timestamp; compare its calendar day with today.
function updatedLabel(updatedAt) {
  const day = new Date(updatedAt).toLocaleDateString('en-CA');
  return day === todayISO() ? 'Updated today' : `Updated ${formatShortDate(day)}`;
}

function CardButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-lg bg-black/25 text-[#E6D6CB] transition-colors hover:bg-black/40 hover:text-ink"
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

export function AccountCard({ account, compact = false, onEdit, onDelete, delay = 0 }) {
  const look = LOOKS[account.type];
  return (
    <article
      className={clsx('lift flex animate-up flex-col justify-between rounded-card border p-6', look.card, compact ? 'h-[170px]' : 'h-[200px]')}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-base font-bold">{account.name}</h3>
        <Badge tone="glass">{look.label}</Badge>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-[#E6D6CB]">Balance</span>
        <Money amount={account.balance} className="font-heading text-[28px] font-bold" />
      </div>

      <div className="flex items-center justify-between gap-2 text-[13px] text-[#E6D6CB]">
        <span>{account.account_number_last4 ? `•••• ${account.account_number_last4}` : 'Wallet'}</span>
        <div className="flex items-center gap-1.5">
          <span>{updatedLabel(account.updated_at)}</span>
          {onEdit && <CardButton icon="edit" label={`Edit ${account.name}`} onClick={() => onEdit(account)} />}
          {onDelete && <CardButton icon="trash" label={`Delete ${account.name}`} onClick={() => onDelete(account)} />}
        </div>
      </div>
    </article>
  );
}
```

**4. AccountForm.** It follows the **form contract** used by every form in the app:
- it keeps its own input values in `useState`;
- on submit it calls `onSubmit(values)`; it **never** calls the API itself (the page does that);
- it shows `errors[field]` (from the server) under each field;
- `submitting` disables the button while saving.

When **editing** (`initial` is an account), the fields start filled in and there's no opening balance: a balance only changes through transactions. Cash wallets have no card number, so that field is hidden for them.

**`client/src/features/accounts/AccountForm.jsx`**
```jsx
import { useState } from 'react';
import { AmountInput } from '../../components/ui/AmountInput.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { TextInput } from '../../components/ui/TextInput.jsx';

const TYPES = [
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'bank', label: 'Bank account' },
  { value: 'cash', label: 'Cash' },
];

export function AccountForm({ initial, onSubmit, onCancel, submitting = false, errors = {} }) {
  const editing = Boolean(initial);
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? 'mobile_money',
    opening_balance: '',
    account_number_last4: initial?.account_number_last4 ?? '',
  });
  const set = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));
  const hasNumber = values.type !== 'cash';

  function handleSubmit(event) {
    event.preventDefault();
    const body = {
      name: values.name,
      type: values.type,
      account_number_last4: hasNumber && values.account_number_last4 ? values.account_number_last4 : null,
    };
    if (!editing) body.opening_balance = values.opening_balance === '' ? 0 : values.opening_balance;
    onSubmit(body);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Name" htmlFor="account-name" error={errors.name}>
        <TextInput
          id="account-name"
          placeholder="e.g. MTN MoMo"
          maxLength={40}
          value={values.name}
          onChange={(e) => set('name')(e.target.value)}
          error={errors.name}
        />
      </FormField>

      <FormField label="Type" htmlFor="account-type" error={errors.type}>
        <Select id="account-type" value={values.type} onChange={set('type')} options={TYPES} error={errors.type} />
      </FormField>

      {!editing && (
        <FormField label="Current balance (RWF)" htmlFor="account-opening" error={errors.opening_balance} hint="What is in this account today">
          <AmountInput id="account-opening" value={values.opening_balance} onChange={set('opening_balance')} error={errors.opening_balance} />
        </FormField>
      )}

      {hasNumber && (
        <FormField label="Last 4 digits (optional)" htmlFor="account-last4" error={errors.account_number_last4}>
          <TextInput
            id="account-last4"
            inputMode="numeric"
            maxLength={4}
            placeholder="7812"
            value={values.account_number_last4}
            onChange={(e) => set('account_number_last4')(e.target.value.replace(/\D/g, ''))}
            error={errors.account_number_last4}
          />
        </FormField>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {editing ? 'Save' : 'Add account'}
        </Button>
      </div>
    </form>
  );
}
```

**5. AccountsPage.** The page connects everything: it gets data from the hooks, draws the cards, and opens a `Modal` with the form or a `ConfirmDialog` for deleting. Two pieces of state drive the modals:
- `editing`: `null` = form closed, `{}` = adding a new account, an account object = editing that one;
- `deleting`: the account waiting for delete confirmation, or `null`.

"Where your money sits" shows each account's share of the total. It's only a *percentage for display*; the money total itself comes from the server.

**`client/src/pages/app/AccountsPage.jsx`**
```jsx
import { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar.jsx';
import { AddTile } from '../../components/ui/AddTile.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { LabeledProgress } from '../../components/ui/LabeledProgress.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Money } from '../../components/ui/Money.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { AccountCard } from '../../features/accounts/AccountCard.jsx';
import { AccountForm } from '../../features/accounts/AccountForm.jsx';
import { useAccounts, useCreateAccount, useDeleteAccount, useTotalBalance, useUpdateAccount } from '../../hooks/useAccounts.js';
import { formatMoney } from '../../lib/formatMoney.js';

export function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: total = 0 } = useTotalBalance();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const toast = useToast();

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const isEdit = Boolean(editing?.id);
  const mutation = isEdit ? updateAccount : createAccount;

  function closeForm() {
    setEditing(null);
    createAccount.reset(); // clear old errors
    updateAccount.reset();
  }

  function save(values) {
    const onSuccess = () => {
      toast.success(isEdit ? 'Account updated' : 'Account added');
      closeForm();
    };
    if (isEdit) updateAccount.mutate({ id: editing.id, ...values }, { onSuccess });
    else createAccount.mutate(values, { onSuccess });
  }

  function confirmDelete() {
    deleteAccount.mutate(deleting.id, {
      onSuccess: (response) => {
        toast.success(
          response.data.archived ? `${deleting.name} archived. It has history, so it is hidden instead of deleted.` : `${deleting.name} deleted`,
        );
        setDeleting(null);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  // Biggest first, for "Where your money sits"
  const byBalance = [...accounts].sort((a, b) => b.balance - a.balance);

  return (
    <>
      <TopBar
        title="Accounts"
        subtitle="Mobile money, bank and cash in one view"
        action={{ label: 'Add account', icon: 'plus', onClick: () => setEditing({}) }}
      />

      <div className="flex animate-up flex-wrap items-baseline gap-x-3.5 gap-y-1" style={{ animationDelay: '.05s' }}>
        <span className="text-[15px] text-ink-muted">Total across accounts</span>
        <Money amount={total} className="font-heading text-[32px] font-bold tracking-[-0.02em] md:text-[40px]" />
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {accounts.map((account, i) => (
            <AccountCard key={account.id} account={account} delay={0.1 + i * 0.08} onEdit={setEditing} onDelete={setDeleting} />
          ))}
          <AddTile label="Add account" hint={accounts.length === 0 ? 'Start with your MoMo, bank or cash' : undefined} onClick={() => setEditing({})} />
        </div>
      )}

      {accounts.length > 0 && total > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Where your money sits" delay={0.4}>
            {byBalance.map((account, i) => {
              const pct = Math.max(0, Math.round((account.balance / total) * 100));
              return (
                <LabeledProgress
                  key={account.id}
                  label={account.name}
                  right={`${formatMoney(account.balance)} · ${pct}%`}
                  value={pct}
                  max={100}
                  delay={0.4 + i * 0.1}
                />
              );
            })}
          </Card>
          {/* Phase 6: "Recent account activity" card goes here */}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={closeForm} title={isEdit ? 'Edit account' : 'New account'}>
        {editing && (
          <AccountForm
            initial={isEdit ? editing : undefined}
            submitting={mutation.isPending}
            errors={mutation.error?.fields}
            onCancel={closeForm}
            onSubmit={save}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name ?? ''}?`}
        message="If this account already has transactions, it will be archived instead: hidden from your lists, with its history kept."
        confirmLabel="Delete"
        loading={deleteAccount.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
```

**6. Route.** In `client/src/routes/router.jsx`, import the page and replace the accounts placeholder:
```jsx
import { AccountsPage } from '../pages/app/AccountsPage.jsx';
// …
{ path: '/accounts', element: <AccountsPage /> },
```

**Check (PR 2):** ☐ the demo user's page matches the mockup (three gradient cards + "Add account" tile, the total, "Where your money sits") ☐ add an account: it appears and the total changes ☐ a wrong value (empty name) shows the error under the field ☐ edit renames it ☐ delete a new account → "deleted"; delete MoMo → "archived" and it disappears ☐ phone width (375px): one card per row, no sideways scrolling ☐ the whole flow works with the keyboard only (Tab, Enter, Esc closes the modal)

---


## Phases 4–11 — what's coming

The full code for these phases arrives in the next updates of this plan. Here's what each one contains, so you can see where the project is going and read ahead in the mockups.

### Phase 4 — Bills
**Wait for:** your Accounts PRs merged.

Bills end to end, the same shape as Accounts: validator, model, controller, routes, `http/bills.http`, `api/bills.js`, `hooks/useBills.js`, `BillForm`, `BillsModal` (list + add/edit/delete) and the dashboard's `UpcomingBillsCard` with a "Manage" link.

| Endpoint | Request | Notes |
|---|---|---|
| `GET /api/bills?status=upcoming\|paid\|all&within_days=` | — | Unpaid bills sorted by due date; `within_days=14` for the dashboard card (overdue bills always included). Each bill has `days_until_due`. |
| `POST /api/bills` | `{ name, amount, due_date, is_recurring, category_id? }` | The category must be an expense category the user can see. |
| `PATCH /api/bills/:id` | any of the POST fields | 404 if not mine |
| `DELETE /api/bills/:id` | — | 404 if not mine |

**Check:** add/edit/delete a bill from the modal; the card shows bills due within 14 days, overdue ones included; user B gets 404 on user A's bill.

### Phase 5 — Budgets
**Wait for:** Tresor's budget usage endpoint (`useBudgetUsage(month)`) and the bill "pay" endpoint.

Budgets create/update/delete (API + `BudgetForm`, `BudgetCard`, `BudgetsPage` with `MonthSwitcher`), from `mockups/ikofi-budgets.html`. One budget per category per month; a duplicate shows "already exists". Plus a "Mark paid" button in `BillsModal`.

### Phase 6 — Savings goals
**Wait for:** Tresor's contribution and account-activity hooks.

Goals list/create/update (API + `GoalCard` with `ProgressRing`, `GoalForm`, `GoalsPage` with stat row and contribution history table), from `mockups/ikofi-goals.html`. On the Accounts page, the "Recent account activity" card.

### Phase 7 — Dashboard and Reports pages
**Wait for:** Tresor's report hooks and chart cards.

`WalletsCard`, `RecentTransactionsCard`, `BudgetUsedCard`, `GoalsCard`, then `DashboardPage` (from `mockups/ikofi-dashboard.html`) and `ReportsPage` (from `mockups/ikofi-reports.html`). Here is one card already written, to show the pattern every dashboard card follows: its own hook, a loading state, an empty state, then the content.

**`client/src/features/dashboard/BudgetUsedCard.jsx`**
```jsx
import { useState } from 'react';
import { Gauge } from '../../components/charts/Gauge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { useBudgetUsage } from '../../hooks/useBudgets.js';
import { formatMoney } from '../../lib/formatMoney.js';

const currentMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7); // 'YYYY-MM'
const plain = (amount) => formatMoney(amount, { currency: '' }).trim();

export function BudgetUsedCard({ delay }) {
  const [month] = useState(currentMonth);
  const { data: usage, isLoading } = useBudgetUsage(month); // GET /api/budgets/usage?month=

  if (isLoading) {
    return (
      <Card title="Budget used" delay={delay}>
        <div className="h-48 animate-pulse rounded-tile bg-surface-raised" />
      </Card>
    );
  }

  if (!usage || usage.items.length === 0) {
    return (
      <Card title="Budget used" delay={delay}>
        <p className="text-sm text-ink-muted">No budgets for this month yet. Set one on the Budgets page.</p>
      </Card>
    );
  }

  const { totals, items } = usage;
  return (
    <Card title="Budget used" delay={delay}>
      <Gauge
        value={totals.spent}
        max={totals.budgeted}
        caption={`${formatMoney(totals.spent)} of ${plain(totals.budgeted)}`}
      />
      {items.slice(0, 3).map((item, index) => (
        <div key={item.id} className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{item.category.name}</span>
            <span className="text-ink-muted">
              {plain(item.spent)} / {plain(item.amount_limit)}
            </span>
          </div>
          <ProgressBar
            value={item.spent}
            max={item.amount_limit}
            tone={item.status === 'over' ? 'danger' : 'gradient'}
            delay={0.4 + index * 0.1}
          />
        </div>
      ))}
    </Card>
  );
}
```

### Phase 8 — Settings: profile and preferences
`PATCH /api/users/me` (API) and the Profile, Security and Preferences cards from `mockups/ikofi-settings.html`. After saving, the sidebar shows the new name straight away.

### Phase 9 — Notifications and password reset pages
The notifications inbox (list, mark read, mark all read: API + `NotificationBell` + `NotificationsPanel`), and the Forgot / Reset password pages inside your `AuthLayout`.

### Phase 10 — Admin users
`GET /api/admin/users` (search, status filter, pages) and `AdminUsersPage`, with Suspend/Restore buttons that use Tresor's endpoint. Admins never see users' money amounts.

### Phase 11 — Responsive and accessibility pass
For every page, at widths 375, 768, 1024 and 1440:
☐ no sideways scrolling ☐ every control reachable with Tab and visibly focused ☐ every input has a label ☐ loading and empty states exist ☐ nothing animates with "reduce motion" on

Write the results as a checklist in your pull request.
