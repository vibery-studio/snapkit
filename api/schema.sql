-- SnapKit D1 Schema
-- Migrates JSON storage from R2 to SQLite

-- Designs table
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  size_preset TEXT NOT NULL,
  size_width INTEGER NOT NULL,
  size_height INTEGER NOT NULL,
  layout TEXT NOT NULL,
  brand TEXT,
  params TEXT NOT NULL DEFAULT '{}', -- JSON
  forked_from TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_designs_brand ON designs(brand);
CREATE INDEX IF NOT EXISTS idx_designs_layout ON designs(layout);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at);

-- Brand kits table
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  colors TEXT NOT NULL DEFAULT '{}', -- JSON
  fonts TEXT NOT NULL DEFAULT '{}', -- JSON
  logos TEXT NOT NULL DEFAULT '[]', -- JSON array
  backgrounds TEXT NOT NULL DEFAULT '[]', -- JSON array
  watermark TEXT, -- JSON or NULL
  default_text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  default_overlay TEXT NOT NULL DEFAULT 'dark',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- Custom layouts table
CREATE TABLE IF NOT EXISTS layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  categories TEXT NOT NULL DEFAULT '[]', -- JSON array
  params TEXT NOT NULL DEFAULT '[]', -- JSON array
  html TEXT NOT NULL,
  css TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  layout TEXT NOT NULL,
  size TEXT NOT NULL,
  params TEXT NOT NULL DEFAULT '{}', -- JSON
  auto_feature_image INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_templates_brand ON templates(brand);
CREATE INDEX IF NOT EXISTS idx_templates_layout ON templates(layout);
