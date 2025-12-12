-- NSH COMPLETE DATABASE SCHEMA
-- Run these queries in your Supabase SQL Editor.
-- It is recommended to run them in blocks if the editor times out.

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";

-- 2. Create Enums (Custom Types)
create type user_role as enum ('user', 'expert', 'admin');
create type listing_status as enum ('draft', 'active', 'pending_approval', 'sold', 'delisted');
create type auth_request_status as enum ('pending', 'in_review', 'completed', 'rejected');
create type order_status as enum ('pending', 'payment_pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- 3. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  role user_role default 'user',
  is_verified boolean default false,
  website text,
  location text,
  trust_score integer default 100,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Metrics (denormalized for performance, updated via triggers ideally, or app logic)
  followers_count integer default 0,
  following_count integer default 0,
  listings_count integer default 0
);

-- RLS: Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 4. COIN CATEGORIES
create table public.coin_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Categories
alter table public.coin_categories enable row level security;
create policy "Categories are viewable by everyone." on coin_categories for select using (true);
-- Only admins can modify categories (requires role check or manual admin seed)

-- 5. COIN LISTINGS
create table public.coin_listings (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'INR',
  category_id uuid references public.coin_categories(id),
  
  -- Coin Specifics
  year integer,
  mint_mark text,
  metal_type text,
  weight_grams numeric,
  diameter_mm numeric,
  composition text,
  condition text, -- e.g. UNC, XF
  
  status listing_status default 'draft',
  stock_quantity integer default 1,
  
  is_featured boolean default false, -- Legacy/Simple flag
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Coin Listings
alter table public.coin_listings enable row level security;
create policy "Active listings are viewable by everyone." on coin_listings for select using (status = 'active' or auth.uid() = seller_id);
create policy "Users can insert their own listings." on coin_listings for insert with check (auth.uid() = seller_id);
create policy "Users can update their own listings." on coin_listings for update using (auth.uid() = seller_id);
create policy "Users can delete their own listings." on coin_listings for delete using (auth.uid() = seller_id);

-- 6. COIN IMAGES
create table public.coin_images (
  id uuid default uuid_generate_v4() primary key,
  coin_id uuid references public.coin_listings(id) on delete cascade not null,
  url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Coin Images
alter table public.coin_images enable row level security;
create policy "Images are viewable by everyone." on coin_images for select using (true);
create policy "Sellers can manage images." on coin_images for all using (
  exists ( select 1 from coin_listings where id = coin_images.coin_id and seller_id = auth.uid() )
);

-- 7. EXPERT AUTHENTICATION REQUESTS
create table public.auth_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  coin_details jsonb, -- { title, year, etc }
  images text[], -- Array of image URLs
  description text,
  
  status auth_request_status default 'pending',
  assigned_expert_id uuid references public.profiles(id),
  
  -- Outcome
  expert_verdict text, -- 'Authentic', 'Fake', 'Uncertain'
  expert_notes text,
  certificate_id text,
  
  -- Payment
  paid boolean default false,
  paid_amount numeric default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Auth Requests
alter table public.auth_requests enable row level security;
create policy "Users can view and create own requests." on auth_requests for all using (auth.uid() = user_id);
create policy "Experts/Admins can view all requests." on auth_requests for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'expert'))
);
create policy "Experts/Admins can update requests." on auth_requests for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'expert'))
);

-- 8. SHIPPING ADDRESSES
create table public.shipping_addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text default 'India',
  phone_number text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Addresses
alter table public.shipping_addresses enable row level security;
create policy "Users manage own addresses." on shipping_addresses for all using (auth.uid() = user_id);

-- 9. ORDERS & ITEMS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  total_amount numeric not null,
  currency text default 'INR',
  status order_status default 'pending',
  
  shipping_address_id uuid references public.shipping_addresses(id),
  payment_intent_id text, -- Gateway ID
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  coin_id uuid references public.coin_listings(id), -- Nullable if coin deleted, but keep record
  seller_id uuid references public.profiles(id),
  
  quantity integer default 1,
  price_at_purchase numeric not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Orders
alter table public.orders enable row level security;
create policy "Users see own orders." on orders for select using (auth.uid() = user_id);
create policy "Admins see all orders." on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 10. SOCIAL FEATURES
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  content text,
  media_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.post_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- RLS: Social
alter table public.posts enable row level security;
create policy "Public posts." on posts for select using (true);
create policy "Users create posts." on posts for insert with check (auth.uid() = user_id);

-- ==========================================
-- ADMIN DASHBOARD TABLES
-- ==========================================

-- 11. ADMIN STORIES
create table public.admin_stories (
  id uuid default uuid_generate_v4() primary key,
  media_url text not null,
  media_type text check (media_type in ('image', 'video')),
  caption text,
  cta_link text,
  cta_text text,
  views_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Admin Stories
alter table public.admin_stories enable row level security;
create policy "Public view, Admin manage." on admin_stories for select using (true);
create policy "Admins manage stories." on admin_stories for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 12. HOME FEED ITEMS (Promos, Seasonal, etc.)
create table public.home_feed_items (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- 'featured_coin', 'expert_promo', 'seasonal_offer', 'educational'
  title text not null,
  subtitle text,
  image_url text,
  priority integer default 0,
  reference_id text, -- ID of coin or page to link to
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Feed
alter table public.home_feed_items enable row level security;
create policy "Public view feed." on home_feed_items for select using (is_visible = true);
create policy "Admins manage feed." on home_feed_items for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 13. FEATURED COINS (Specifically for the Featured module)
create table public.featured_coin_configs (
  id uuid default uuid_generate_v4() primary key,
  coin_id uuid references public.coin_listings(id) on delete cascade unique,
  priority integer default 0,
  promo_text text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Featured
alter table public.featured_coin_configs enable row level security;
create policy "Public view featured." on featured_coin_configs for select using (is_active = true);
create policy "Admins manage featured." on featured_coin_configs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 14. DISCOUNTS
create table public.discounts (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  percentage numeric not null,
  min_order_amount numeric default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  usage_limit integer,
  used_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Discounts
alter table public.discounts enable row level security;
create policy "Admins manage discounts." on discounts for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can read active codes." on discounts for select using (is_active = true);

-- 15. NSH WALLET TRANSACTIONS
create table public.nsh_wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  amount numeric not null,
  transaction_type text check (transaction_type in ('credit', 'debit')),
  description text,
  reference_id text, -- Order ID or Auth Request ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Wallet
alter table public.nsh_wallet_transactions enable row level security;
create policy "Users view own wallet." on nsh_wallet_transactions for select using (auth.uid() = user_id);
create policy "Admins manage wallet." on nsh_wallet_transactions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_profiles_modtime before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_coins_modtime before update on coin_listings for each row execute procedure update_updated_at_column();
create trigger update_orders_modtime before update on orders for each row execute procedure update_updated_at_column();

-- ==========================================
-- FINAL ADMIN POLICY (Backstop)
-- ==========================================
-- This policy gives admins full access to everything. 
-- Note: Supabase policies are permissive (OR), so adding this usually grants access even if other policies exist.
-- However, for complex RLS, specific admin policies per table is safer/cleaner. 
-- We added "Admins manage..." policies to specific tables above. 

-- If you want a Global Admin Override:
-- create policy "Admins can do everything on profiles" on profiles for all using (
--   exists (select 1 from profiles where id = auth.uid() and role = 'admin')
-- );
-- Note: Cannot do recursive check on profiles easily without infinite recursion risk in some modes, 
-- but 'role' check is internal on same row for self, or via lookup. 
-- The above specific policies are safer.

