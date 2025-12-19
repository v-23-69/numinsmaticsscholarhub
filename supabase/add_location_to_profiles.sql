-- Add location column to profiles table if it doesn't exist
-- This stores the formatted address string

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN location TEXT;
        
        COMMENT ON COLUMN public.profiles.location IS 'Formatted address string (address line 1, address line 2, city, state, postal code, country)';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'location';
