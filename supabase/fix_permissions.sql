-- Grants usage on the schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grants standard permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grants permissions on sequences (for ID generation)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure RLS is still active (just a safety check, doesn't change anything if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Re-apply proper public SELECT policy if it was somehow missing or corrupted
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
