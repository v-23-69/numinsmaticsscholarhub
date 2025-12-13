-- ==========================================
-- FIXED QUERIES FOR EXPERT AUTH ENHANCEMENTS
-- Run these queries in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- PART 1: CREATE THREADS AND MESSAGES TABLES (if they don't exist)
-- ==========================================

-- Create threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT DEFAULT 'dm' CHECK (type IN ('dm', 'expert', 'support')),
    participant_ids UUID[] NOT NULL,
    auth_request_id UUID REFERENCES public.auth_requests(id),
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on threads and messages
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PART 2: ADD NEW COLUMNS TO THREADS TABLE
-- ==========================================

DO $$ 
BEGIN
    -- Add typing_user_id column if it doesn't exist
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

-- ==========================================
-- PART 3: UPDATE THREADS RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Participants view threads" ON public.threads;
DROP POLICY IF EXISTS "Participants manage threads" ON public.threads;
DROP POLICY IF EXISTS "Experts/Admins view expert threads" ON public.threads;

-- Create new policies
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

-- ==========================================
-- PART 4: UPDATE MESSAGES RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Participants manage messages" ON public.messages;
DROP POLICY IF EXISTS "Participants view messages" ON public.messages;

-- Create new policies
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

-- ==========================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Indexes for threads table
CREATE INDEX IF NOT EXISTS idx_threads_auth_request_id ON public.threads(auth_request_id);
CREATE INDEX IF NOT EXISTS idx_threads_participant_ids ON public.threads USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_threads_is_active ON public.threads(is_active);
CREATE INDEX IF NOT EXISTS idx_threads_typing_user_id ON public.threads(typing_user_id);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Indexes for auth_requests table
CREATE INDEX IF NOT EXISTS idx_auth_requests_status ON public.auth_requests(status);
CREATE INDEX IF NOT EXISTS idx_auth_requests_assigned_expert ON public.auth_requests(assigned_expert_id);

-- Index for nsh_wallets table (if not already exists)
CREATE INDEX IF NOT EXISTS idx_nsh_wallets_user_id ON public.nsh_wallets(user_id);

-- ==========================================
-- PART 6: TRIGGER FOR WALLET UPDATED_AT
-- ==========================================

-- Function: Update wallet updated_at
CREATE OR REPLACE FUNCTION public.update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_nsh_wallets_modtime ON public.nsh_wallets;
CREATE TRIGGER update_nsh_wallets_modtime
    BEFORE UPDATE ON public.nsh_wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_updated_at();

-- ==========================================
-- PART 7: FUNCTION AND TRIGGER FOR EXPERT NOTIFICATIONS
-- ==========================================

-- Function: Notify Expert of New Request
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

-- ==========================================
-- PART 8: FUNCTION AND TRIGGER FOR AUTO-CREATE THREAD
-- ==========================================

-- Function: Auto-create thread when request is assigned
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
            
            -- Update notification with thread_id if it exists
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

