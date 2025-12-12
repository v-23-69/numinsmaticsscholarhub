-- 1. Get your User ID from the 'auth.users' table or the 'profiles' table.
-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with the email you just signed up with.

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM'
);

-- Verify the change
SELECT * FROM public.profiles WHERE role = 'admin';
