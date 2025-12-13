
-- Expert Auth Revamp Schema

-- 1. NSH Wallet Table (if not exists)
CREATE TABLE IF NOT EXISTS public.nsh_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.nsh_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wallet" ON public.nsh_wallets FOR SELECT USING (auth.uid() = user_id);
-- Only system/admin typically updates wallet, but for demo we might allow RPC or specific functions

-- 2. Mock function to add initial coins (for testing)
CREATE OR REPLACE FUNCTION public.claim_demo_coins()
RETURNS void AS $$
BEGIN
    INSERT INTO public.nsh_wallets (user_id, balance)
    VALUES (auth.uid(), 100.00)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = nsh_wallets.balance + 100.00;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to Pay for Authentication
CREATE OR REPLACE FUNCTION public.pay_for_auth_request(amount DECIMAL)
RETURNS boolean AS $$
DECLARE
    current_bal DECIMAL;
BEGIN
    -- Check balance
    SELECT balance INTO current_bal FROM public.nsh_wallets WHERE user_id = auth.uid();
    
    IF current_bal IS NULL OR current_bal < amount THEN
        RETURN false;
    END IF;

    -- Deduct
    UPDATE public.nsh_wallets SET balance = balance - amount WHERE user_id = auth.uid();
    
    -- Log transaction
    INSERT INTO public.nsh_wallet_transactions (user_id, amount, transaction_type, description)
    VALUES (auth.uid(), amount, 'debit', 'Expert Authentication Fee');
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure Threads/Messages policies are open for the participants
DROP POLICY IF EXISTS "Participants view threads" ON public.threads;
CREATE POLICY "Participants view threads" ON public.threads 
FOR ALL USING (auth.uid() = ANY(participant_ids));

DROP POLICY IF EXISTS "Participants manage messages" ON public.messages;
CREATE POLICY "Participants manage messages" ON public.messages 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.threads 
        WHERE id = messages.thread_id 
        AND auth.uid() = ANY(participant_ids)
    )
);

-- 5. Trigger to Create Wallet on User Creation (Recycle handle_new_user logic if needed, or just lazy create)
-- We will rely on lazy creation or the claim_demo_coins for now.

