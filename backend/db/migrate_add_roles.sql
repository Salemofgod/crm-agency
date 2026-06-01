-- Add teams table
CREATE TABLE IF NOT EXISTS teams (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add team_id and owner_id to existing tables
ALTER TABLE users    ADD COLUMN IF NOT EXISTS team_id   INT REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE clients  ADD COLUMN IF NOT EXISTS owner_id  INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE sales    ADD COLUMN IF NOT EXISTS owner_id  INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS team_id   INT REFERENCES teams(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_team      ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_clients_owner   ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_sales_owner     ON sales(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team      ON tasks(team_id);
