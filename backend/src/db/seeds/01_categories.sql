INSERT INTO categories (user_id, name, type, color) VALUES
  (NULL, 'Food',          'expense', 'orange'),
  (NULL, 'Transport',     'expense', 'amber'),
  (NULL, 'Utilities',     'expense', 'yellow'),
  (NULL, 'Housing',       'expense', 'purple'),
  (NULL, 'Entertainment', 'expense', 'blue'),
  (NULL, 'Health',        'expense', 'green'),
  (NULL, 'Education',     'expense', 'olive'),
  (NULL, 'Other',         'expense', 'neutral'),
  (NULL, 'Salary',        'income',  'green'),
  (NULL, 'Freelance',     'income',  'green'),
  (NULL, 'Other income',  'income',  'green')
ON CONFLICT DO NOTHING;