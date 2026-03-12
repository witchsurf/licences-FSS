-- Create the Licenses Table
CREATE TABLE licenses (
  id text PRIMARY KEY,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "birthDate" text NOT NULL, -- YYYY-MM-DD
  nationality text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  club text NOT NULL,
  category text NOT NULL, -- Junior, Senior, Pro
  type text NOT NULL, -- Compétition, Loisir
  "issueDate" text NOT NULL,
  "expirationDate" text NOT NULL,
  "photoUrl" text,
  status text NOT NULL DEFAULT 'VALIDE', -- VALIDE, EXPIRÉ, DÉSACTIVÉ
  "createdAt" bigint NOT NULL
);

-- Enable Row Level Security (RLS) - Recommended best practice
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create Policy: Service Role (Server) has full access
-- Note: When using the Service Role Key in the backend, these policies are bypassed.
-- But if you ever switch to client-side logic, you'll need policies.
-- For now, we allow public read if you want the public verification page to work without API:
CREATE POLICY "Public Read Access" ON licenses
  FOR SELECT USING (true);

-- Storage Setup
-- You need to create a bucket named 'licenses-photos' in the Storage dashboard.
-- Or run this if you have the extensions enabled:
INSERT INTO storage.buckets (id, name, public) VALUES ('licenses-photos', 'licenses-photos', true);

-- Storage Policy
CREATE POLICY "Public Access to Photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'licenses-photos');

CREATE POLICY "Authenticated Uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'licenses-photos');

-- Sequence for License IDs
CREATE SEQUENCE IF NOT EXISTS license_seq START 1;

-- RPC Function to generate next license ID atomically
CREATE OR REPLACE FUNCTION generate_next_license_id()
RETURNS text AS $$
DECLARE
  next_val integer;
  year_text text;
BEGIN
  next_val := nextval('license_seq');
  year_text := to_char(current_date, 'YYYY');
  RETURN 'FSS-' || year_text || '-' || lpad(next_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
