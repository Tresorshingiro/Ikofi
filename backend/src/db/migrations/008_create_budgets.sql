CREATE TABLE budgets (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount_limit  NUMERIC(14,2) NOT NULL CHECK (amount_limit > 0),
    month         DATE NOT NULL CHECK (EXTRACT(DAY FROM month) = 1),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, month, category_id)
);