-- Fix NSH Wallets RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Check if table exists and has RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'nsh_wallets';

-- 2. Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users view own wallet" ON public.nsh_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.nsh_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.nsh_wallets;

-- 3. Ensure RLS is enabled
ALTER TABLE public.nsh_wallets ENABLE ROW LEVEL SECURITY;

-- 4. Create SELECT policy (users can view their own wallet)
CREATE POLICY "Users view own wallet" 
ON public.nsh_wallets 
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Create INSERT policy (users can create their own wallet)
CREATE POLICY "Users can insert own wallet" 
ON public.nsh_wallets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Create UPDATE policy (users can update their own wallet balance)
CREATE POLICY "Users can update own wallet" 
ON public.nsh_wallets 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'nsh_wallets';
