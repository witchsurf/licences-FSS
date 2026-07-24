-- Correct the official club name on licenses created before the application
-- started normalizing club names.
UPDATE public.licenses
SET club = 'TAKE OFF NGOR'
WHERE upper(trim(club)) = 'TAKEOFF NGOR';
