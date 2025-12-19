# Address Save Fix

## Issue
The address was not being saved properly to the `profiles.location` column, causing the form to reappear asking users to fill their address.

## Root Causes
1. The `location` column update was done separately after the main profile update, and errors were silently caught
2. The `location` column might not exist in the database schema
3. The update logic didn't verify if the location was actually saved

## Fixes Applied

### 1. Database Migration
Created `supabase/add_location_to_profiles.sql` to ensure the `location` column exists:
```sql
-- Adds location TEXT column to profiles table if it doesn't exist
```

**Action Required**: Run this migration in Supabase SQL Editor.

### 2. Profile Update Logic
- **Changed**: Address is now included in the main `profileUpdate` object instead of a separate update
- **Added**: Better error handling for missing `location` column
- **Added**: Fallback logic to try updating location separately if main update fails
- **Added**: Verification step to check if location was actually saved before completing

### 3. Profile Completion Check
- **Updated**: Profile completion check now includes `location` in SELECT queries (for debugging/monitoring)
- **Note**: Profile completion still only requires `display_name` - address is optional but should be saved if provided

## Files Modified

1. **New File**: `supabase/add_location_to_profiles.sql` - Migration to add location column
2. **Modified**: `src/pages/mobile/ProfileSetup.tsx`
   - Address now included in main profile update
   - Better error handling and verification
   - Fallback save attempts if initial save fails
3. **Modified**: `src/components/auth/ProtectedRoute.tsx` - Added `location` to SELECT queries
4. **Modified**: `src/pages/mobile/MobileAuth.tsx` - Added `location` to SELECT queries

## Testing Steps

1. Run the migration: `supabase/add_location_to_profiles.sql`
2. Create/update a profile with address
3. Check `profiles` table - `location` column should contain the formatted address string
4. Verify form doesn't reappear after successful save
5. Check that address is displayed correctly in profile view

## Address Format
The address is saved as a comma-separated string:
```
"Address Line 1, Address Line 2, City, State, Postal Code, Country"
```

Empty fields are filtered out, so if Address Line 2 is empty, it won't appear in the string.

## Notes
- Address is saved to both `profiles.location` (formatted string) and `shipping_addresses` table (structured data)
- If `location` column doesn't exist, the code will attempt to create it via migration
- Profile completion only requires `display_name` - address is optional but should be saved if provided
