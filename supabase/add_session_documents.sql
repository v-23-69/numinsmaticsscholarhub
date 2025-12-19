-- Add session_documents table to store expert session transcripts
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.session_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_request_id UUID NOT NULL REFERENCES public.auth_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id),
  document_url TEXT, -- URL to stored PDF/document
  document_content JSONB, -- Full transcript content (Q&A, messages, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auth_request_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_documents_user_id ON public.session_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_session_documents_auth_request_id ON public.session_documents(auth_request_id);

-- Enable RLS
ALTER TABLE public.session_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own session documents" 
ON public.session_documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session documents" 
ON public.session_documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can view documents for their sessions" 
ON public.session_documents FOR SELECT 
USING (auth.uid() = expert_id);

-- Verify the table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'session_documents'
ORDER BY ordinal_position;
