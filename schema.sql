CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  email TEXT NOT NULL,
  stage TEXT, tester INTEGER, form TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
  fbclid TEXT, gclid TEXT, country TEXT
);
CREATE INDEX IF NOT EXISTS signups_email ON signups(email);
