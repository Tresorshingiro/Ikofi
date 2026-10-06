CREATE TABLE bills (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    amount        NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    due_date      DATE NOT NULL,
    is_recurring  BOOLEAN NOT NULL DEFAULT false,
    is_paid       BOOLEAN NOT NULL DEFAULT false,
    paid_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);