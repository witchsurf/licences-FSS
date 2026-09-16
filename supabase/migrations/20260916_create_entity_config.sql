-- Migration: Create entity_config table for persistent organization settings
CREATE TABLE IF NOT EXISTS entity_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE entity_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on entity_config" ON entity_config
  FOR SELECT USING (true);

-- Allow server and authenticated full access
CREATE POLICY "Allow full access on entity_config" ON entity_config
  FOR ALL USING (true);
