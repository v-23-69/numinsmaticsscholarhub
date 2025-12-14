-- Add session_started_at column to auth_requests table for session tracking
-- This column tracks when a session actually starts (when expert accepts)

ALTER TABLE public.auth_requests 
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_auth_requests_session_started_at 
ON public.auth_requests(session_started_at);

-- Add comment
COMMENT ON COLUMN public.auth_requests.session_started_at IS 'Timestamp when the expert accepted the request and session started. Used for 5-minute session timer.';
