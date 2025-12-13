# Supabase Schema Extraction Queries

Use these queries in your Supabase SQL Editor to extract all schema information. Copy the results and paste them for documentation.

## 1. Get All Tables

```sql
SELECT 
  table_name,
  table_type,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## 2. Get All Columns for Each Table

```sql
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
ORDER BY table_name, ordinal_position;
```

## 3. Get All Indexes

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 4. Get All Foreign Keys

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
  AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
```

## 5. Get All Primary Keys

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;
```

## 6. Get All Functions (RPC)

```sql
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END AS volatility,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

## 7. Get Function Definitions

```sql
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

## 8. Get All Triggers

```sql
SELECT 
  trigger_name,
  event_object_table AS table_name,
  event_manipulation AS event,
  action_timing AS timing,
  action_statement AS definition,
  action_condition AS condition
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

## 9. Get All RLS Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 10. Get All Sequences

```sql
SELECT 
  sequence_name,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment,
  cycle_option
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
```

## 11. Get All Views

```sql
SELECT 
  table_name AS view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

## 12. Get All Extensions

```sql
SELECT 
  extname AS extension_name,
  extversion AS version
FROM pg_extension
ORDER BY extname;
```

## 13. Get Storage Buckets (via Supabase Dashboard)

Go to: **Storage** → **Buckets** in Supabase Dashboard

Or use this query if you have access to `storage.buckets`:

```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
ORDER BY name;
```

## 14. Get Storage Policies

```sql
SELECT 
  id,
  bucket_id,
  name,
  definition,
  check_expression,
  created_at
FROM storage.policies
ORDER BY bucket_id, name;
```

## 15. Get Table Row Counts (Optional)

```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 16. Get Table Sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## How to Use

1. Run each query in Supabase SQL Editor
2. Copy the results (CSV or table format)
3. Paste the results when asked
4. I will populate the `DATABASE_SCHEMA.md` file with all the information

## Quick Export All

Run this to get a comprehensive overview:

```sql
-- Comprehensive Schema Overview
SELECT 
  'TABLES' as object_type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  'FUNCTIONS' as object_type,
  COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'

UNION ALL

SELECT 
  'TRIGGERS' as object_type,
  COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'

UNION ALL

SELECT 
  'INDEXES' as object_type,
  COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'FOREIGN KEYS' as object_type,
  COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public';
```

