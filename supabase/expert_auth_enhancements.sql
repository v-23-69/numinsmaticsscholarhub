-- ==========================================
-- NSH Expert Authentication & Admin Enhancements
-- Run these queries in Supabase SQL Editor
-- ==========================================

-- 1. Ensure NSH Wallets Table Exists
CREATE TABLE IF NOT EXISTS public.nsh_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.nsh_wallets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users view own wallet" ON public.nsh_wallets;
DROP POLICY IF EXISTS "Users manage own wallet" ON public.nsh_wallets;
DROP POLICY IF EXISTS "Admins manage wallets" ON public.nsh_wallets;

-- RLS Policies for Wallets
CREATE POLICY "Users view own wallet" ON public.nsh_wallets 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all wallets" ON public.nsh_wallets 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. Ensure Threads Table Has Required Columns
DO $$ 
BEGIN
    -- Add typing_indicator column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'threads' 
        AND column_name = 'typing_user_id'
    ) THEN
        ALTER TABLE public.threads ADD COLUMN typing_user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'threads' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.threads ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add ended_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'threads' 
        AND column_name = 'ended_at'
    ) THEN
        ALTER TABLE public.threads ADD COLUMN ended_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Update Auth Requests Table - Ensure images is array type
DO $$
BEGIN
    -- Check if images column exists and is correct type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'auth_requests' 
        AND column_name = 'images'
    ) THEN
        -- If it's JSONB, we might want to keep it, but ensure it can store array
        -- For now, we'll work with existing structure
        NULL;
    END IF;
END $$;

-- 4. RPC Function: Get Wallet Balance
CREATE OR REPLACE FUNCTION public.get_wallet_balance()
RETURNS DECIMAL AS $$
DECLARE
    wallet_balance DECIMAL;
BEGIN
    SELECT COALESCE(balance, 0) INTO wallet_balance 
    FROM public.nsh_wallets 
    WHERE user_id = auth.uid();
    
    -- If wallet doesn't exist, create it with 0 balance
    IF wallet_balance IS NULL THEN
        INSERT INTO public.nsh_wallets (user_id, balance)
        VALUES (auth.uid(), 0.00)
        ON CONFLICT (user_id) DO NOTHING;
        RETURN 0.00;
    END IF;
    
    RETURN wallet_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC Function: Claim Demo Coins (for testing)
CREATE OR REPLACE FUNCTION public.claim_demo_coins()
RETURNS void AS $$
BEGIN
    INSERT INTO public.nsh_wallets (user_id, balance)
    VALUES (auth.uid(), 100.00)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = nsh_wallets.balance + 100.00,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC Function: Pay for Authentication Request
CREATE OR REPLACE FUNCTION public.pay_for_auth_request(amount DECIMAL)
RETURNS boolean AS $$
DECLARE
    current_bal DECIMAL;
BEGIN
    -- Get or create wallet
    SELECT COALESCE(balance, 0) INTO current_bal 
    FROM public.nsh_wallets 
    WHERE user_id = auth.uid();
    
    -- Create wallet if doesn't exist
    IF current_bal IS NULL THEN
        INSERT INTO public.nsh_wallets (user_id, balance)
        VALUES (auth.uid(), 0.00)
        ON CONFLICT (user_id) DO NOTHING;
        current_bal := 0.00;
    END IF;
    
    -- Check balance
    IF current_bal < amount THEN
        RETURN false;
    END IF;

    -- Deduct amount
    UPDATE public.nsh_wallets 
    SET balance = balance - amount,
        updated_at = now()
    WHERE user_id = auth.uid();
    
    -- Log transaction
    INSERT INTO public.nsh_wallet_transactions (
        user_id, 
        amount, 
        transaction_type, 
        description,
        reference_id
    )
    VALUES (
        auth.uid(), 
        -amount, 
        'debit', 
        'Expert Authentication Fee',
        NULL
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC Function: End Expert Session
CREATE OR REPLACE FUNCTION public.end_expert_session(thread_id_param UUID)
RETURNS boolean AS $$
DECLARE
    thread_record RECORD;
BEGIN
    -- Get thread details
    SELECT * INTO thread_record
    FROM public.threads
    WHERE id = thread_id_param;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if user is participant (expert or admin)
    IF NOT (auth.uid() = ANY(thread_record.participant_ids) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'expert'))) THEN
        RETURN false;
    END IF;
    
    -- Update thread to inactive
    UPDATE public.threads
    SET is_active = false,
        ended_at = now()
    WHERE id = thread_id_param;
    
    -- Update auth request status if exists
    IF thread_record.auth_request_id IS NOT NULL THEN
        UPDATE public.auth_requests
        SET status = 'completed',
            updated_at = now()
        WHERE id = thread_record.auth_request_id
        AND status = 'in_review';
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC Function: Set Typing Indicator
CREATE OR REPLACE FUNCTION public.set_typing_indicator(thread_id_param UUID, is_typing BOOLEAN)
RETURNS void AS $$
BEGIN
    IF is_typing THEN
        UPDATE public.threads
        SET typing_user_id = auth.uid()
        WHERE id = thread_id_param
        AND auth.uid() = ANY(participant_ids);
    ELSE
        UPDATE public.threads
        SET typing_user_id = NULL
        WHERE id = thread_id_param
        AND typing_user_id = auth.uid();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update Threads RLS Policies
DROP POLICY IF EXISTS "Participants view threads" ON public.threads;
DROP POLICY IF EXISTS "Participants manage threads" ON public.threads;
DROP POLICY IF EXISTS "Experts/Admins view expert threads" ON public.threads;

CREATE POLICY "Participants view threads" ON public.threads 
    FOR SELECT USING (
        auth.uid() = ANY(participant_ids) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'expert')
        )
    );

CREATE POLICY "Participants manage threads" ON public.threads 
    FOR ALL USING (
        auth.uid() = ANY(participant_ids) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 10. Update Messages RLS Policies
DROP POLICY IF EXISTS "Participants manage messages" ON public.messages;
DROP POLICY IF EXISTS "Participants view messages" ON public.messages;

CREATE POLICY "Participants view messages" ON public.messages 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.threads 
            WHERE id = messages.thread_id 
            AND (
                auth.uid() = ANY(participant_ids) OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'expert')
                )
            )
        )
    );

CREATE POLICY "Participants manage messages" ON public.messages 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.threads 
            WHERE id = messages.thread_id 
            AND auth.uid() = ANY(participant_ids)
        )
    );

-- 11. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_threads_auth_request_id ON public.threads(auth_request_id);
CREATE INDEX IF NOT EXISTS idx_threads_participant_ids ON public.threads USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_threads_is_active ON public.threads(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_requests_status ON public.auth_requests(status);
CREATE INDEX IF NOT EXISTS idx_auth_requests_assigned_expert ON public.auth_requests(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_nsh_wallets_user_id ON public.nsh_wallets(user_id);

-- 12. Trigger: Update wallet updated_at
CREATE OR REPLACE FUNCTION public.update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_nsh_wallets_modtime ON public.nsh_wallets;
CREATE TRIGGER update_nsh_wallets_modtime
    BEFORE UPDATE ON public.nsh_wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_updated_at();

-- 13. Function: Notify Expert of New Request
CREATE OR REPLACE FUNCTION public.notify_expert_new_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for assigned expert
    IF NEW.assigned_expert_id IS NOT NULL AND NEW.status = 'in_review' THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            payload
        ) VALUES (
            NEW.assigned_expert_id,
            'expert_request',
            'New Authentication Request',
            'You have been assigned a new coin authentication request.',
            jsonb_build_object('auth_request_id', NEW.id, 'thread_id', NULL)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_notify_expert_new_request ON public.auth_requests;
CREATE TRIGGER trigger_notify_expert_new_request
    AFTER UPDATE OF assigned_expert_id, status ON public.auth_requests
    FOR EACH ROW
    WHEN (NEW.assigned_expert_id IS NOT NULL AND NEW.status = 'in_review')
    EXECUTE FUNCTION public.notify_expert_new_request();

-- 14. Function: Auto-create thread when request is assigned
CREATE OR REPLACE FUNCTION public.create_thread_on_expert_assignment()
RETURNS TRIGGER AS $$
DECLARE
    new_thread_id UUID;
BEGIN
    -- Only create thread if expert is assigned and status is in_review
    IF NEW.assigned_expert_id IS NOT NULL 
       AND NEW.status = 'in_review' 
       AND (OLD.assigned_expert_id IS NULL OR OLD.status != 'in_review') THEN
        
        -- Check if thread already exists
        SELECT id INTO new_thread_id
        FROM public.threads
        WHERE auth_request_id = NEW.id;
        
        -- Create thread if doesn't exist
        IF new_thread_id IS NULL THEN
            INSERT INTO public.threads (
                type,
                participant_ids,
                auth_request_id,
                is_active
            ) VALUES (
                'expert',
                ARRAY[NEW.user_id, NEW.assigned_expert_id],
                NEW.id,
                true
            ) RETURNING id INTO new_thread_id;
            
            -- Update notification with thread_id
            UPDATE public.notifications
            SET payload = jsonb_set(
                COALESCE(payload, '{}'::jsonb),
                '{thread_id}',
                to_jsonb(new_thread_id::text)
            )
            WHERE user_id = NEW.assigned_expert_id
            AND type = 'expert_request'
            AND payload->>'auth_request_id' = NEW.id::text;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_create_thread_on_assignment ON public.auth_requests;
CREATE TRIGGER trigger_create_thread_on_assignment
    AFTER UPDATE ON public.auth_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.create_thread_on_expert_assignment();

