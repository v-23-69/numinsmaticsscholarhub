-- Fix RLS Policy for Experts to Accept/Update Auth Requests
-- This allows experts and admins to update auth_requests even if they're not yet assigned

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users update auth requests" ON public.auth_requests;

-- Create a new policy that allows:
-- 1. Users to update their own requests
-- 2. Assigned experts to update requests
-- 3. Experts/Admins to update any request (for accepting/assigning)
CREATE POLICY "Users update auth requests" 
ON public.auth_requests 
FOR UPDATE 
USING (
    -- User can update their own request
    auth.uid() = user_id 
    OR 
    -- Assigned expert can update the request
    auth.uid() = assigned_expert_id
    OR
    -- Experts and admins can update any request (for accepting/assigning)
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('expert', 'admin', 'admin_market', 'master_admin')
    )
);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'auth_requests' AND cmd = 'UPDATE';




