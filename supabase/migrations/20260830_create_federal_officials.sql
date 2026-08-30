CREATE TABLE IF NOT EXISTS federal_officials (
  id text PRIMARY KEY,
  title text NOT NULL,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "birthDate" text NOT NULL,
  nationality text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  "issueDate" text NOT NULL,
  "expirationDate" text NOT NULL,
  "photoUrl" text,
  "createdAt" bigint NOT NULL
);

ALTER TABLE federal_officials ENABLE ROW LEVEL SECURITY;
CREATE SEQUENCE IF NOT EXISTS federal_official_seq START 1;

CREATE OR REPLACE FUNCTION generate_next_federal_official_id()
RETURNS text AS $$
DECLARE next_val integer;
BEGIN
  next_val := nextval('federal_official_seq');
  RETURN 'FSS-CAD-' || to_char(current_date, 'YYYY') || '-' || lpad(next_val::text, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
