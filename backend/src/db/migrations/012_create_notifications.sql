CREATE TABLE notifications (
    id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type     TEXT NOT NULL CHECK (type IN ('budget_near', 'budget_over', 'bill_due', 'goal_reached')),
    title    TEXT NOT NULL,
    body     TEXT NOT NULL,
    link     TEXT,
    dedupe_key  TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, dedupe_key)
);