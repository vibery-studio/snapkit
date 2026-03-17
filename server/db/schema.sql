-- SnapKit SQLite Schema

CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  size_preset TEXT NOT NULL,
  size_width INTEGER NOT NULL,
  size_height INTEGER NOT NULL,
  layout TEXT NOT NULL,
  brand TEXT,
  params TEXT NOT NULL DEFAULT '{}',
  forked_from TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_designs_brand ON designs(brand);
CREATE INDEX IF NOT EXISTS idx_designs_layout ON designs(layout);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  colors TEXT NOT NULL DEFAULT '{}',
  fonts TEXT NOT NULL DEFAULT '{}',
  logos TEXT NOT NULL DEFAULT '[]',
  backgrounds TEXT NOT NULL DEFAULT '[]',
  watermark TEXT,
  default_text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  default_overlay TEXT NOT NULL DEFAULT 'dark',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

CREATE TABLE IF NOT EXISTS layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  categories TEXT NOT NULL DEFAULT '[]',
  params TEXT NOT NULL DEFAULT '[]',
  html TEXT NOT NULL,
  css TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  layout TEXT NOT NULL,
  size TEXT NOT NULL,
  params TEXT NOT NULL DEFAULT '{}',
  auto_feature_image INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_templates_brand ON templates(brand);
CREATE INDEX IF NOT EXISTS idx_templates_layout ON templates(layout);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  path TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);
