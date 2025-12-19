-- Fix Notifications Table and Clean Up Duplicate Policies

-- 1. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy for notifications if it doesn't exist
DROP POLICY IF EXISTS "Users manage notifications" ON public.notifications;
CREATE POLICY "Users manage notifications" 
ON public.notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- 4. Remove duplicate UPDATE policies on auth_requests
-- Keep only the one that allows experts to update
DROP POLICY IF EXISTS "auth_requests_update_policy" ON public.auth_requests;

-- 5. Ensure we have the correct policy (should already exist from previous script)
-- This policy allows:
-- - Users to update their own requests
-- - Assigned experts to update requests  
-- - Experts/Admins to update any request
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'auth_requests' 
        AND policyname = 'Users update auth requests'
        AND cmd = 'UPDATE'
    ) THEN
        CREATE POLICY "Users update auth requests" 
        ON public.auth_requests 
        FOR UPDATE 
        USING (
            auth.uid() = user_id 
            OR 
            auth.uid() = assigned_expert_id
            OR
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('expert', 'admin', 'admin_market', 'master_admin')
            )
        );
    END IF;
END $$;

-- 6. Verify policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'auth_requests' AND cmd = 'UPDATE';

-- 7. Verify notifications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'notifications';




