CREATE INDEX transactions_user_date_idx  ON transactions (user_id, date DESC, id DESC);
CREATE INDEX transactions_user_category_idx ON transactions (user_id, category_id, date);
CREATE INDEX transactions_account_idx ON transactions (account_id);

CREATE INDEX accounts_user_idx ON accounts (user_id);

CREATE UNIQUE INDEX categories_user_name_idx ON categories (user_id, lower(name), type) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX categories_global_name_idx ON categories (lower(name), type) WHERE user_id IS NULL;

CREATE INDEX savings_goals_user_idx  ON savings_goals (user_id);
CREATE INDEX goal_contributions_user_date_idx ON goal_contributions (user_id, date DESC);
CREATE INDEX goal_contributions_goal_idx ON goal_contributions (goal_id);
CREATE INDEX transfers_user_date_idx ON transfers (user_id, date DESC);
CREATE INDEX bills_user_due_idx ON bills (user_id, due_date) WHERE is_paid = false;
CREATE INDEX notifications_user_idx ON notifications (user_id, is_read, created_at DESC);