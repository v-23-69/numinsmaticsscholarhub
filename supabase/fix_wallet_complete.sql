-- Complete Fix for NSH Wallets
-- Run this in your Supabase SQL Editor

-- 1. Fix INSERT policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.nsh_wallets;
CREATE POLICY "Users can insert own wallet" 
ON public.nsh_wallets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Update claim_demo_coins function to give 500 coins instead of 100
CREATE OR REPLACE FUNCTION public.claim_demo_coins()
RETURNS void AS $$
BEGIN
    INSERT INTO public.nsh_wallets (user_id, balance)
    VALUES (auth.uid(), 500.00)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = nsh_wallets.balance + 500.00;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update handle_new_user function to also create wallet with 500 coins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'Collector'),
        NEW.raw_user_meta_data ->> 'avatar_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create user role
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.id, 'buyer')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Create wallet with 500 NSH coins for new users
    INSERT INTO public.nsh_wallets (user_id, balance)
    VALUES (NEW.id, 500.00)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 5. Verify policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'nsh_wallets';




