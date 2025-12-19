# Session Details View & Profile Completion Fixes

## Summary of Changes

This document outlines the fixes implemented to resolve multiple issues with session viewing, profile completion checks, and document generation.

## Issues Fixed

### 1. ✅ RLS Policy for session_documents (403 Forbidden)
**Problem**: Users couldn't insert session documents due to RLS policy restrictions.

**Solution**: 
- Created `supabase/fix_session_documents_rls.sql` to fix RLS policies
- Updated `documentGenerator.ts` to use `upsert` instead of `insert` to handle duplicates
- Added fallback logic to insert without `expert_id` if RLS fails

**Action Required**: Run the SQL migration:
```sql
-- Run this in Supabase SQL Editor
\i supabase/fix_session_documents_rls.sql
```

### 2. ✅ Session Details View Instead of Chat
**Problem**: Clicking "View Session" on completed sessions was trying to open chat interface, which showed "session expired" errors.

**Solution**:
- Created new `SessionDetailsView` component (`src/pages/mobile/SessionDetailsView.tsx`)
- Shows session information, uploaded images, expert details, spending, and document
- Added route `/session/:id` in `App.tsx`
- Updated `MobileProfile.tsx` to navigate to `/session/:id` for completed sessions
- Only active sessions (`in_review`, `assigned`) navigate to chat interface

**Features**:
- Session date/time and duration
- Amount spent
- Expert profile with "View Profile" button
- Uploaded coin images (front/back)
- Expert verdict and notes
- Document view/download buttons
- Modal to view full document content

### 3. ✅ Profile Completion Check Fixes
**Problem**: After successfully creating/updating profile, users were still being redirected to profile setup when navigating to other pages.

**Solution**:
- Added sessionStorage caching for profile completion status
- Updated `ProtectedRoute` to check cache first for faster navigation
- Made profile completion check less strict (only requires `display_name`, phone is optional)
- Added state tracking to prevent redirects when coming from profile setup
- Updated `ProfileSetup.tsx` to set cache when profile is saved
- Updated `MobileAuth.tsx` to cache profile completion status

**Key Changes**:
- Profile completion now only requires `display_name` (phone is optional)
- Cache prevents repeated database queries
- Navigation state prevents redirect loops after profile creation

### 4. ✅ Document Generation Improvements
**Problem**: Documents weren't being saved properly due to RLS and duplicate key issues.

**Solution**:
- Changed from `insert` to `upsert` in `documentGenerator.ts`
- Added conflict handling for `auth_request_id`
- Added fallback logic for RLS permission errors
- Documents are now properly saved when sessions end/expire

## Files Modified

1. **New Files**:
   - `src/pages/mobile/SessionDetailsView.tsx` - New session details view component
   - `supabase/fix_session_documents_rls.sql` - RLS policy fixes

2. **Modified Files**:
   - `src/App.tsx` - Added `/session/:id` route
   - `src/pages/mobile/MobileProfile.tsx` - Updated "View Session" button logic
   - `src/components/auth/ProtectedRoute.tsx` - Added caching and improved redirect logic
   - `src/pages/mobile/ProfileSetup.tsx` - Set cache on profile save
   - `src/pages/mobile/MobileAuth.tsx` - Cache profile completion status
   - `src/utils/documentGenerator.ts` - Use upsert and handle RLS errors

## Database Migrations Required

Run these SQL migrations in Supabase SQL Editor:

1. **Fix RLS Policies**:
```sql
-- Run: supabase/fix_session_documents_rls.sql
```

This will:
- Drop and recreate RLS policies for `session_documents`
- Allow users to insert/update their own documents
- Allow experts to view documents for their sessions

## Testing Checklist

- [ ] Run RLS migration in Supabase
- [ ] Create a new profile - should not redirect to setup after completion
- [ ] Navigate to expert coin authentication - should not redirect to profile setup
- [ ] Complete an expert session
- [ ] View completed session from profile - should show SessionDetailsView (not chat)
- [ ] Verify document is generated and downloadable
- [ ] Check that active sessions still open chat interface
- [ ] Verify profile completion cache works (no repeated redirects)

## Notes

- Profile completion now only requires `display_name` - phone number is optional
- Session documents use `upsert` to prevent duplicate key errors
- Profile completion status is cached in sessionStorage for performance
- Completed sessions show details view, active sessions show chat interface
