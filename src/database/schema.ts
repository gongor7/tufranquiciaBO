export const SCHEMA_VERSION = 2;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(name) > 0),
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'inversionista'
    CHECK(role IN ('inversionista', 'franquiciador')),
  avatar_url TEXT,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS franchises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL CHECK(length(name) > 0),
  slug TEXT UNIQUE NOT NULL,
  logo_emoji TEXT DEFAULT '🏢',
  tagline TEXT,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  industry_emoji TEXT DEFAULT '📁',
  country TEXT DEFAULT 'Bolivia',
  department TEXT NOT NULL,
  city TEXT NOT NULL,
  min_investment REAL NOT NULL CHECK(min_investment >= 0),
  max_investment REAL NOT NULL CHECK(max_investment >= min_investment),
  currency TEXT DEFAULT 'USD',
  royalty_percentage REAL CHECK(royalty_percentage >= 0 AND royalty_percentage <= 100),
  royalty_type TEXT DEFAULT 'mensual'
    CHECK(royalty_type IN ('mensual', 'anual')),
  estimated_roi TEXT,
  employees_required INTEGER DEFAULT 1,
  training_weeks INTEGER DEFAULT 1,
  support_level TEXT DEFAULT 'basico'
    CHECK(support_level IN ('basico', 'avanzado', 'premium')),
  website TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  whatsapp TEXT,
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'activa'
    CHECK(status IN ('activa', 'pausada', 'cerrada')),
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  segment TEXT NOT NULL DEFAULT 'franquicia'
    CHECK(segment IN ('franquicia', 'sociedad', 'proyecto', 'mipe')),
  subtype TEXT,
  sought_amount REAL,
  available_percentage REAL
    CHECK(available_percentage IS NULL OR (available_percentage >= 1 AND available_percentage <= 100)),
  project_start DATE,
  project_end DATE,
  mipe_stage TEXT CHECK(mipe_stage IS NULL OR mipe_stage IN ('idea', 'validado', 'operativo')),
  pitch TEXT,
  video_url TEXT,
  formalization_plan TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  franchise_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  target_date DATE,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  franchise_id INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  franchise_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  UNIQUE(franchise_id),
  FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_completed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_franchises_industry ON franchises(industry);
CREATE INDEX IF NOT EXISTS idx_franchises_department ON franchises(department);
CREATE INDEX IF NOT EXISTS idx_franchises_investment ON franchises(min_investment, max_investment);
CREATE INDEX IF NOT EXISTS idx_franchises_status ON franchises(status);
CREATE INDEX IF NOT EXISTS idx_franchises_featured ON franchises(featured);
CREATE INDEX IF NOT EXISTS idx_franchises_segment ON franchises(segment);
CREATE INDEX IF NOT EXISTS idx_franchises_mipe_stage ON franchises(mipe_stage);
CREATE INDEX IF NOT EXISTS idx_milestones_franchise ON milestones(franchise_id);
CREATE INDEX IF NOT EXISTS idx_messages_franchise ON messages(franchise_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
`;

export const COUNT_FRANCHISES_SQL = 'SELECT COUNT(*) AS total FROM franchises;';
export const COUNT_USERS_SQL = 'SELECT COUNT(*) AS total FROM users;';
export const COUNT_FAVORITES_SQL = 'SELECT COUNT(*) AS total FROM favorites;';
export const COUNT_MESSAGES_SQL = 'SELECT COUNT(*) AS total FROM messages;';