CREATE TABLE categories (
    id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name    TEXT NOT NULL,
    type    TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color   TEXT NOT NULL DEFAULT 'neutral',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);