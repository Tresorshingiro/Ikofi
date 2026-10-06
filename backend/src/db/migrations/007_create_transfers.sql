CREATE TABLE transfers (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_account_id   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    to_account_id     INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    amount            NUMERIC (14,2) NOT NULL CHECK (amount > 0),
    description       TEXT,
    date              DATE NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (from_account_id <> to_account_id)
);