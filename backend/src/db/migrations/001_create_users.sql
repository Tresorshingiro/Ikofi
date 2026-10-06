CREATE TABLE users (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name        TEXT NOT NULL,
    email            TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
    password_hash    TEXT NOT NULL,
    role             TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active        BOOLEAN NOT NULL DEFAULT true,
    daily_limit      NUMERIC(14,2) CHECK (daily_limit > 0),
    phone            TEXT,
    city             TEXT,
    currency         TEXT NOT NULL DEFAULT 'RWF',
    month_start_day  SMALLINT NOT NULL DEFAULT 1 CHECK (month_start_day BETWEEN 1 AND 28),
    budget_alerts    BOOLEAN NOT NULL DEFAULT true,
    weekly_summary_email  BOOLEAN NOT NULL DEFAULT false,
    password_changed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);