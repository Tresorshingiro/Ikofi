# Ikofi

Personal money management: accounts, transactions, budgets, savings goals and reports.
API: Express + PostgreSQL in `backend/`. App: React + Vite in `client/`.

## Run it locally

Requirements: Node.js 20.12+, PostgreSQL 16, Git.

```bash
cd backend
npm install
cp .env.example .env          # Windows: copy .env.example .env
# edit .env: put your postgres password in DATABASE_URL
psql -U postgres -c "CREATE DATABASE ikofi;"
npm run migrate
npm run seed:demo             # demo login: demo@ikofi.test / demo-password
npm run check:balances
npm run dev                   # http://localhost:4000/api/health
```

## After every `git pull`

```bash
cd backend
npm install
npm run migrate
```

## Plans

`plans/nadine.md`.