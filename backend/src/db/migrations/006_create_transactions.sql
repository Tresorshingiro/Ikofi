CREATE TABLE transactions (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id      INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id     INTEGER NOT NULL REFERENCES categories(id) on DELETE RESTRICT,
    type            TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount          NUMERIC(14,2) NOT NULL CHECK(amount > 0),
    description     TEXT NOT NULL,
    date            DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);