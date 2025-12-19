-- Add social_links JSONB column to profiles table
-- Run this in your Supabase SQL Editor

-- Add social_links column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'social_links'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_social_links ON public.profiles USING GIN (social_links);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'social_links';
