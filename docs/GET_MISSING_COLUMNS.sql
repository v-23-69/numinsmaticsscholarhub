-- ==========================================
-- Queries to Get Missing Column Information
-- Run these in Supabase SQL Editor
-- ==========================================

-- 1. Get All Columns for 'orders' Table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Get All Columns for 'post_likes' Table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'post_likes'
ORDER BY ordinal_position;

-- 3. Get All Columns for 'posts' Table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- 4. Get All Columns for 'profiles' Table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Get All Columns for 'shipping_addresses' Table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'shipping_addresses'
ORDER BY ordinal_position;

-- ==========================================
-- ALTERNATIVE: Get All Missing Tables at Once
-- ==========================================
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'post_likes', 'posts', 'profiles', 'shipping_addresses')
ORDER BY table_name, ordinal_position;

