CREATE TABLE accounts (
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) on DELETE CASCADE,
    name         TEXT NOT NULL,
    type         TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'mobile_money')),
    opening_balance  NUMERIC (14,2) NOT NULL DEFAULT 0,
    balance          NUMERIC (14, 2) NOT NULL DEFAULT 0,
    account_number_last4  VARCHAR(4),
    is_archived           BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);