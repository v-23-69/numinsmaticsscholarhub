
-- 1. Admin Stories (Distinct from user stories, for specific admin controls)
create table if not exists admin_stories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  cta_link text,
  cta_text text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  views_count integer default 0,
  is_active boolean default true
);

-- 2. Home Feed Items (For managing the dynamic home feed)
create table if not exists home_feed_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('featured_coin', 'expert_promo', 'seasonal_offer', 'educational')),
  title text not null,
  subtitle text,
  image_url text,
  -- reference_id can point to coin_listings.id, or external links
  reference_id text, 
  priority integer default 0,
  is_visible boolean default true,
  display_duration_start timestamp with time zone,
  display_duration_end timestamp with time zone
);

-- 3. Featured Coin Metadata (Extends coin_listings with feature-specific scheduling)
create table if not exists featured_coin_configs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  coin_id uuid references coin_listings(id) not null,
  priority integer default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  promo_banner_text text,
  is_active boolean default true
);

-- 4. NSH Wallet Transactions (Virtual currency history)
create table if not exists nsh_wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('credit', 'debit')),
  description text,
  -- reference_id can point to orders.id or auth_requests.id
  reference_id text 
);

-- 5. Discounts (Promotional codes)
create table if not exists discounts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  code text unique not null,
  percentage numeric not null,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  min_order_amount numeric default 0,
  applicable_coin_ids uuid[], -- Array of coin_listings IDs
  is_active boolean default true
);

-- 6. Shopify Sync Log (To track synchronization status)
create table if not exists shopify_sync_logs (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text not null check (status in ('success', 'failed', 'partial')),
    items_synced integer default 0,
    errors jsonb,
    triggered_by uuid references auth.users(id)
);

-- Enable RLS
alter table admin_stories enable row level security;
alter table home_feed_items enable row level security;
alter table featured_coin_configs enable row level security;
alter table nsh_wallet_transactions enable row level security;
alter table discounts enable row level security;
alter table shopify_sync_logs enable row level security;

-- Policies (Simplified for development, assuming authenticated admin access will be refined)
create policy "Enable read access for all users" on admin_stories for select using (true);
create policy "Enable read access for all users" on home_feed_items for select using (true);
create policy "Enable read access for all users" on featured_coin_configs for select using (true);

-- Admin write access (Currently allowing all authenticated users for dev speed, RESTRICT IN PROD)
create policy "Enable all access for authenticated users" on admin_stories for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on home_feed_items for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on featured_coin_configs for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on nsh_wallet_transactions for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on discounts for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on shopify_sync_logs for all using (auth.role() = 'authenticated');
