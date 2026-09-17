-- Migration: Regularize all licenses and federal officials to calendar year expiration (YYYY-12-31)
-- In sports federations, licenses are valid strictly for the calendar year, ending December 31st.

-- 1. Regularize licenses based on issueDate
UPDATE licenses
SET "expirationDate" = SUBSTRING("issueDate", 1, 4) || '-12-31'
WHERE "issueDate" IS NOT NULL 
  AND LENGTH("issueDate") >= 4
  AND "expirationDate" != (SUBSTRING("issueDate", 1, 4) || '-12-31');

-- 2. Specifically ensure any license issued or identified for 2026 expires on 2026-12-31
UPDATE licenses
SET "expirationDate" = '2026-12-31'
WHERE (id LIKE '%-2026-%' OR "issueDate" LIKE '2026%')
  AND "expirationDate" != '2026-12-31';

-- 3. Regularize federal officials based on issueDate
UPDATE federal_officials
SET "expirationDate" = SUBSTRING("issueDate", 1, 4) || '-12-31'
WHERE "issueDate" IS NOT NULL 
  AND LENGTH("issueDate") >= 4
  AND "expirationDate" != (SUBSTRING("issueDate", 1, 4) || '-12-31');

-- 4. Specifically ensure any federal official from 2026 expires on 2026-12-31
UPDATE federal_officials
SET "expirationDate" = '2026-12-31'
WHERE (id LIKE '%-2026-%' OR "issueDate" LIKE '2026%')
  AND "expirationDate" != '2026-12-31';
