-- Database schema for Subscriptions Manager

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL,
  start_date TEXT NOT NULL, -- ISO date format
  renewal_date TEXT NOT NULL, -- ISO date format
  payment_method TEXT,
  account TEXT, -- Email or username
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  cancellation_info TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  reminder_date TEXT NOT NULL, -- ISO date format
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default settings
INSERT OR IGNORE INTO settings (id, reminder_days_before) VALUES ('default', 7);