-- Fix RLS policies for session_documents table
-- This allows users to insert their own session documents

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own session documents" ON public.session_documents;
DROP POLICY IF EXISTS "Users can insert own session documents" ON public.session_documents;
DROP POLICY IF EXISTS "Experts can view documents for their sessions" ON public.session_documents;

-- Recreate policies with proper checks
CREATE POLICY "Users can view own session documents" 
ON public.session_documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session documents" 
ON public.session_documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session documents" 
ON public.session_documents FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can view documents for their sessions" 
ON public.session_documents FOR SELECT 
USING (auth.uid() = expert_id);

-- Also allow service role to insert (for server-side operations)
-- Note: This requires service role key, which is handled server-side
-- For client-side, the user_id check should work
