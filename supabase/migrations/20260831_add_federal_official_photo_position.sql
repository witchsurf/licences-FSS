ALTER TABLE federal_officials
  ADD COLUMN IF NOT EXISTS "photoPositionX" numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "photoPositionY" numeric NOT NULL DEFAULT 50;
