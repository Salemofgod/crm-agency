DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  UNIQUE NOT NULL,
  password   VARCHAR(255)  NOT NULL,
  role       VARCHAR(20)   NOT NULL DEFAULT 'staff'
                           CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP     DEFAULT NOW(),
  updated_at TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE clients (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(150)  NOT NULL,
  email      VARCHAR(150)  UNIQUE NOT NULL,
  phone      VARCHAR(30),
  company    VARCHAR(150),
  address    TEXT,
  status     VARCHAR(20)   NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'inactive', 'prospect')),
  notes      TEXT,
  created_by INT           REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP     DEFAULT NOW(),
  updated_at TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE sales (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200)    NOT NULL,
  client_id   INT             NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount      NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  status      VARCHAR(20)     NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'won', 'lost', 'in_progress')),
  description TEXT,
  deal_date   DATE,
  created_by  INT             REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP       DEFAULT NOW(),
  updated_at  TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200)  NOT NULL,
  description TEXT,
  status      VARCHAR(20)   NOT NULL DEFAULT 'todo'
                            CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    VARCHAR(10)   NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('low', 'medium', 'high')),
  due_date    DATE,
  client_id   INT           REFERENCES clients(id) ON DELETE SET NULL,
  sale_id     INT           REFERENCES sales(id) ON DELETE SET NULL,
  assigned_to INT           REFERENCES users(id) ON DELETE SET NULL,
  created_by  INT           REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  sale_id    INT           NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  author_id  INT           REFERENCES users(id) ON DELETE SET NULL,
  content    TEXT          NOT NULL,
  created_at TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX idx_clients_status   ON clients(status);
CREATE INDEX idx_sales_client_id  ON sales(client_id);
CREATE INDEX idx_sales_status     ON sales(status);
CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_tasks_assigned   ON tasks(assigned_to);
CREATE INDEX idx_tasks_client_id  ON tasks(client_id);
CREATE INDEX idx_comments_sale_id ON comments(sale_id);
