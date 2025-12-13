# NSH Database Schema Documentation

> **Last Updated:** 2025-01-28 (Complete - Added threads, messages, wallets, and all expert authentication features)  
> **Database:** Supabase PostgreSQL  
> **Project:** Numismatics Scholar Hub (NSH)

---

## Table of Contents

1. [Tables](#tables)
2. [Columns & Data Types](#columns--data-types)
3. [Indexes](#indexes)
4. [Foreign Keys & Relationships](#foreign-keys--relationships)
5. [Functions (RPC)](#functions-rpc)
6. [Triggers](#triggers)
7. [Storage Buckets](#storage-buckets)
8. [Policies (RLS)](#policies-rls)
9. [Extensions](#extensions)
10. [Change Log](#change-log)

---

## Tables

### Overview
| Table Name | Description | Column Count | Total Size | Table Size | Indexes Size | Status |
|------------|-------------|--------------|------------|------------|--------------|--------|
| `admin_stories` | Admin-created stories for home feed | 9 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `auth_requests` | Coin authentication requests from users | 14 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `coin_categories` | Categories for coin listings | 6 | 48 kB | 8 kB | 40 kB | ✅ Complete |
| `coin_images` | Images associated with coin listings | 5 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `coin_listings` | Main coin marketplace listings | 19 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `discounts` | Discount codes and promotions | 10 | 24 kB | 0 bytes | 24 kB | ✅ Complete |
| `featured_coin_configs` | Configuration for featured coins | 8 | 24 kB | 0 bytes | 24 kB | ✅ Complete |
| `follows` | User follow relationships | 4 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `home_feed_items` | Curated home feed content | 9 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `nsh_wallet_transactions` | NSH wallet transaction history | 7 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `nsh_wallets` | NSH wallet balances for users | 5 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `order_items` | Individual items within orders | 7 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `orders` | Customer orders | 9 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `post_likes` | User likes on posts | 4 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `posts` | User-generated posts | 5 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `profiles` | User profiles (extends auth.users) | 15 | 48 kB | 8 kB | 40 kB | ✅ Complete |
| `shipping_addresses` | User shipping addresses | 12 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `threads` | Chat threads for messaging | 8 | 16 kB | 0 bytes | 16 kB | ✅ Complete |
| `messages` | Messages within chat threads | 6 | 16 kB | 0 bytes | 16 kB | ✅ Complete |

**Total Tables:** 19  
**Total Database Size:** ~320 kB (as of documentation date)

**Size Notes:**
- Most tables are empty (0 bytes table size) with only index structures
- `coin_categories` and `profiles` have 8 kB of actual data
- Index sizes are consistent across tables (16-40 kB)

---

## Columns & Data Types

### Table: `admin_stories`
**Description:** Admin-created stories displayed in the home feed

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `media_url` | text | NO | - | URL to story media |
| `media_type` | text | YES | - | Type of media (image/video) |
| `caption` | text | YES | - | Story caption text |
| `cta_link` | text | YES | - | Call-to-action link |
| `cta_text` | text | YES | - | Call-to-action text |
| `views_count` | integer | YES | `0` | Number of views |
| `is_active` | boolean | YES | `true` | Whether story is active |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `auth_requests`
**Description:** Coin authentication requests submitted by users

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to profiles.id |
| `coin_details` | jsonb | YES | - | JSON details about the coin |
| `images` | ARRAY | YES | - | Array of image URLs |
| `description` | text | YES | - | User's description |
| `status` | auth_request_status | YES | `'pending'::auth_request_status` | Request status enum |
| `assigned_expert_id` | uuid | YES | - | Foreign key to profiles.id (expert) |
| `expert_verdict` | text | YES | - | Expert's authentication verdict |
| `expert_notes` | text | YES | - | Expert's notes |
| `certificate_id` | text | YES | - | Certificate ID if authenticated |
| `paid` | boolean | YES | `false` | Whether payment was made |
| `paid_amount` | numeric | YES | `0` | Amount paid for authentication |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Last update timestamp |

**Enum Types:**
- `auth_request_status`: `'pending'`, `'in_review'`, `'completed'`, `'rejected'`

---

### Table: `coin_categories`
**Description:** Categories for organizing coin listings

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `name` | text | NO | - | Category name |
| `slug` | text | NO | - | URL-friendly slug (unique) |
| `description` | text | YES | - | Category description |
| `image_url` | text | YES | - | Category image URL |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `coin_images`
**Description:** Images associated with coin listings

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `coin_id` | uuid | NO | - | Foreign key to coin_listings.id (CASCADE delete) |
| `url` | text | NO | - | Image URL |
| `display_order` | integer | YES | `0` | Order for display |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `coin_listings`
**Description:** Main marketplace coin listings

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `seller_id` | uuid | NO | - | Foreign key to profiles.id |
| `title` | text | NO | - | Listing title |
| `description` | text | YES | - | Detailed description |
| `price` | numeric | NO | - | Price in currency |
| `currency` | text | YES | `'INR'::text` | Currency code |
| `category_id` | uuid | YES | - | Foreign key to coin_categories.id |
| `year` | integer | YES | - | Year of coin |
| `mint_mark` | text | YES | - | Mint mark information |
| `metal_type` | text | YES | - | Type of metal (Gold, Silver, etc.) |
| `weight_grams` | numeric | YES | - | Weight in grams |
| `diameter_mm` | numeric | YES | - | Diameter in millimeters |
| `composition` | text | YES | - | Metal composition |
| `condition` | text | YES | - | Coin condition |
| `status` | listing_status | YES | `'draft'::listing_status` | Listing status enum |
| `stock_quantity` | integer | YES | `1` | Available stock |
| `is_featured` | boolean | YES | `false` | Whether listing is featured |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Last update timestamp |

**Enum Types:**
- `listing_status`: `'draft'`, `'active'`, `'pending_approval'`, `'sold'`, `'delisted'`

---

### Table: `discounts`
**Description:** Discount codes and promotional offers

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `code` | text | NO | - | Discount code (unique) |
| `percentage` | numeric | NO | - | Discount percentage |
| `min_order_amount` | numeric | YES | `0` | Minimum order amount |
| `start_date` | timestamp with time zone | YES | - | Start date |
| `end_date` | timestamp with time zone | YES | - | End date |
| `usage_limit` | integer | YES | - | Maximum usage count |
| `used_count` | integer | YES | `0` | Current usage count |
| `is_active` | boolean | YES | `true` | Whether discount is active |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `featured_coin_configs`
**Description:** Configuration for featured coin displays

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `coin_id` | uuid | YES | - | Foreign key to coin_listings.id (CASCADE delete, unique) |
| `priority` | integer | YES | `0` | Display priority |
| `promo_text` | text | YES | - | Promotional text |
| `start_date` | timestamp with time zone | YES | - | Start date |
| `end_date` | timestamp with time zone | YES | - | End date |
| `is_active` | boolean | YES | `true` | Whether config is active |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `follows`
**Description:** User follow relationships

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `follower_id` | uuid | NO | - | Foreign key to profiles.id (follower) |
| `following_id` | uuid | NO | - | Foreign key to profiles.id (following) |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

**Unique Constraint:** `(follower_id, following_id)`

---

### Table: `home_feed_items`
**Description:** Curated items for home feed display

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `type` | text | NO | - | Item type (featured, promotion, education, auction) |
| `title` | text | NO | - | Item title |
| `subtitle` | text | YES | - | Item subtitle |
| `image_url` | text | YES | - | Item image URL |
| `priority` | integer | YES | `0` | Display priority |
| `reference_id` | text | YES | - | Reference to related entity |
| `is_visible` | boolean | YES | `true` | Whether item is visible |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `nsh_wallet_transactions`
**Description:** NSH wallet transaction history

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to profiles.id |
| `amount` | numeric | NO | - | Transaction amount |
| `transaction_type` | text | YES | - | Type of transaction |
| `description` | text | YES | - | Transaction description |
| `reference_id` | text | YES | - | Reference to related entity |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `order_items`
**Description:** Individual items within orders

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `order_id` | uuid | NO | - | Foreign key to orders.id (CASCADE delete) |
| `coin_id` | uuid | YES | - | Foreign key to coin_listings.id |
| `seller_id` | uuid | YES | - | Foreign key to profiles.id |
| `quantity` | integer | YES | `1` | Item quantity |
| `price_at_purchase` | numeric | NO | - | Price at time of purchase |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `orders`
**Description:** Customer orders

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to profiles.id |
| `total_amount` | numeric | NO | - | Total order amount |
| `currency` | text | YES | `'INR'::text` | Currency code |
| `status` | order_status | YES | `'pending'::order_status` | Order status enum |
| `shipping_address_id` | uuid | YES | - | Foreign key to shipping_addresses.id |
| `payment_intent_id` | text | YES | - | Payment gateway intent ID |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Last update timestamp |

**Enum Types:**
- `order_status`: `'pending'`, `'payment_pending'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`, `'refunded'`

---

### Table: `post_likes`
**Description:** User likes on posts

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to profiles.id |
| `post_id` | uuid | NO | - | Foreign key to posts.id (CASCADE delete) |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

**Unique Constraint:** `(user_id, post_id)` - Prevents duplicate likes

---

### Table: `posts`
**Description:** User-generated posts

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to profiles.id |
| `content` | text | YES | - | Post content text |
| `media_urls` | ARRAY | YES | - | Array of media URLs |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

### Table: `profiles`
**Description:** User profiles (extends auth.users)

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | - | Primary key (references auth.users.id) |
| `username` | text | YES | - | Unique username |
| `display_name` | text | YES | - | Display name |
| `avatar_url` | text | YES | - | Avatar image URL |
| `bio` | text | YES | - | User biography |
| `role` | user_role | YES | `'user'::user_role` | User role enum |
| `is_verified` | boolean | YES | `false` | Verification status |
| `website` | text | YES | - | Website URL |
| `location` | text | YES | - | User location |
| `trust_score` | integer | YES | `100` | Trust score (0-100) |
| `joined_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Join timestamp |
| `updated_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Last update timestamp |
| `followers_count` | integer | YES | `0` | Denormalized followers count |
| `following_count` | integer | YES | `0` | Denormalized following count |
| `listings_count` | integer | YES | `0` | Denormalized listings count |

**Unique Constraint:** `username` (unique)

**Enum Types:**
- `user_role`: `'user'`, `'expert'`, `'admin'`

**Notes:**
- `id` references `auth.users.id` (CASCADE delete)
- Denormalized counts (`followers_count`, `following_count`, `listings_count`) should be updated via triggers or application logic

---

### Table: `nsh_wallets`
**Description:** NSH wallet balances for users

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to auth.users.id (UNIQUE) |
| `balance` | decimal(12,2) | NO | `0.00` | Wallet balance in NSH coins |
| `created_at` | timestamp with time zone | NO | `now()` | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | `now()` | Last update timestamp |

**Unique Constraint:** `user_id` (one wallet per user)

**Notes:**
- `user_id` references `auth.users.id` (CASCADE delete)
- Balance defaults to 0.00 for new wallets
- `updated_at` is automatically updated via trigger

---

### Table: `threads`
**Description:** Chat threads for messaging (DM, expert authentication, support)

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `type` | text | YES | `'dm'` | Thread type: 'dm', 'expert', 'support' |
| `participant_ids` | uuid[] | NO | - | Array of user IDs participating in thread |
| `auth_request_id` | uuid | YES | - | Foreign key to auth_requests.id (for expert threads) |
| `typing_user_id` | uuid | YES | - | User ID currently typing (for typing indicator) |
| `is_active` | boolean | YES | `true` | Whether thread is active (not ended) |
| `ended_at` | timestamp with time zone | YES | - | Timestamp when thread was ended |
| `last_message_at` | timestamp with time zone | YES | `now()` | Timestamp of last message |
| `created_at` | timestamp with time zone | YES | `now()` | Creation timestamp |

**Check Constraints:**
- `type` must be one of: 'dm', 'expert', 'support'

**Notes:**
- `auth_request_id` references `auth_requests.id` (for expert authentication threads)
- `typing_user_id` references `auth.users.id` (for real-time typing indicators)
- `participant_ids` is an array containing all user IDs in the conversation
- When `is_active` is false, the thread is closed and no new messages can be sent

---

### Table: `messages`
**Description:** Messages within chat threads

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `thread_id` | uuid | NO | - | Foreign key to threads.id |
| `sender_id` | uuid | NO | - | Foreign key to auth.users.id (message sender) |
| `content` | text | YES | - | Message content text |
| `attachments` | jsonb | YES | `'[]'` | JSON array of attachment URLs/metadata |
| `is_read` | boolean | YES | `false` | Whether message has been read |
| `created_at` | timestamp with time zone | YES | `now()` | Creation timestamp |

**Notes:**
- `thread_id` references `threads.id` (CASCADE delete)
- `sender_id` references `auth.users.id` (CASCADE delete)
- `attachments` can store file URLs, images, or other media metadata

---

### Table: `shipping_addresses`
**Description:** User shipping addresses

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | NO | - | Foreign key to profiles.id |
| `full_name` | text | NO | - | Full name for shipping |
| `address_line1` | text | NO | - | Primary address line |
| `address_line2` | text | YES | - | Secondary address line |
| `city` | text | NO | - | City |
| `state` | text | NO | - | State/Province |
| `postal_code` | text | NO | - | Postal/ZIP code |
| `country` | text | YES | `'India'::text` | Country (default: India) |
| `phone_number` | text | YES | - | Contact phone number |
| `is_default` | boolean | YES | `false` | Whether this is the default address |
| `created_at` | timestamp with time zone | NO | `timezone('utc'::text, now())` | Creation timestamp |

---

## Indexes

| Index Name | Table | Columns | Type | Unique | Description |
|------------|-------|---------|------|--------|-------------|
| `admin_stories_pkey` | `admin_stories` | `id` | btree | ✅ | Primary key |
| `auth_requests_pkey` | `auth_requests` | `id` | btree | ✅ | Primary key |
| `coin_categories_pkey` | `coin_categories` | `id` | btree | ✅ | Primary key |
| `coin_categories_slug_key` | `coin_categories` | `slug` | btree | ✅ | Unique slug |
| `coin_images_pkey` | `coin_images` | `id` | btree | ✅ | Primary key |
| `coin_listings_pkey` | `coin_listings` | `id` | btree | ✅ | Primary key |
| `discounts_pkey` | `discounts` | `id` | btree | ✅ | Primary key |
| `discounts_code_key` | `discounts` | `code` | btree | ✅ | Unique discount code |
| `featured_coin_configs_pkey` | `featured_coin_configs` | `id` | btree | ✅ | Primary key |
| `featured_coin_configs_coin_id_key` | `featured_coin_configs` | `coin_id` | btree | ✅ | Unique coin_id |
| `follows_pkey` | `follows` | `id` | btree | ✅ | Primary key |
| `follows_follower_id_following_id_key` | `follows` | `follower_id, following_id` | btree | ✅ | Unique follow relationship |
| `home_feed_items_pkey` | `home_feed_items` | `id` | btree | ✅ | Primary key |
| `nsh_wallet_transactions_pkey` | `nsh_wallet_transactions` | `id` | btree | ✅ | Primary key |
| `order_items_pkey` | `order_items` | `id` | btree | ✅ | Primary key |
| `orders_pkey` | `orders` | `id` | btree | ✅ | Primary key |
| `post_likes_pkey` | `post_likes` | `id` | btree | ✅ | Primary key |
| `post_likes_user_id_post_id_key` | `post_likes` | `user_id, post_id` | btree | ✅ | Unique like relationship |
| `posts_pkey` | `posts` | `id` | btree | ✅ | Primary key |
| `profiles_pkey` | `profiles` | `id` | btree | ✅ | Primary key |
| `profiles_username_key` | `profiles` | `username` | btree | ✅ | Unique username |
| `shipping_addresses_pkey` | `shipping_addresses` | `id` | btree | ✅ | Primary key |
| `threads_pkey` | `threads` | `id` | btree | ✅ | Primary key |
| `messages_pkey` | `messages` | `id` | btree | ✅ | Primary key |
| `nsh_wallets_pkey` | `nsh_wallets` | `id` | btree | ✅ | Primary key |
| `nsh_wallets_user_id_key` | `nsh_wallets` | `user_id` | btree | ✅ | Unique user_id |
| `idx_threads_auth_request_id` | `threads` | `auth_request_id` | btree | ❌ | Index for auth request lookup |
| `idx_threads_participant_ids` | `threads` | `participant_ids` | gin | ❌ | GIN index for array searches |
| `idx_threads_is_active` | `threads` | `is_active` | btree | ❌ | Index for active thread filtering |
| `idx_threads_typing_user_id` | `threads` | `typing_user_id` | btree | ❌ | Index for typing indicator queries |
| `idx_messages_thread_id` | `messages` | `thread_id` | btree | ❌ | Index for thread message lookup |
| `idx_messages_created_at` | `messages` | `created_at` | btree | ❌ | Index for message ordering (DESC) |
| `idx_messages_sender_id` | `messages` | `sender_id` | btree | ❌ | Index for sender lookup |
| `idx_auth_requests_status` | `auth_requests` | `status` | btree | ❌ | Index for status filtering |
| `idx_auth_requests_assigned_expert` | `auth_requests` | `assigned_expert_id` | btree | ❌ | Index for expert assignment lookup |
| `idx_nsh_wallets_user_id` | `nsh_wallets` | `user_id` | btree | ❌ | Index for wallet lookup |

**Total Indexes:** 37

---

## Foreign Keys & Relationships

| Constraint Name | From Table | From Column | To Table | To Column | On Delete | On Update |
|-----------------|------------|-------------|----------|-----------|-----------|-----------|
| `auth_requests_assigned_expert_id_fkey` | `auth_requests` | `assigned_expert_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `auth_requests_user_id_fkey` | `auth_requests` | `user_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `coin_images_coin_id_fkey` | `coin_images` | `coin_id` | `coin_listings` | `id` | CASCADE | NO ACTION |
| `coin_listings_category_id_fkey` | `coin_listings` | `category_id` | `coin_categories` | `id` | NO ACTION | NO ACTION |
| `coin_listings_seller_id_fkey` | `coin_listings` | `seller_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `featured_coin_configs_coin_id_fkey` | `featured_coin_configs` | `coin_id` | `coin_listings` | `id` | CASCADE | NO ACTION |
| `follows_follower_id_fkey` | `follows` | `follower_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `follows_following_id_fkey` | `follows` | `following_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `nsh_wallet_transactions_user_id_fkey` | `nsh_wallet_transactions` | `user_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `order_items_coin_id_fkey` | `order_items` | `coin_id` | `coin_listings` | `id` | NO ACTION | NO ACTION |
| `order_items_order_id_fkey` | `order_items` | `order_id` | `orders` | `id` | CASCADE | NO ACTION |
| `order_items_seller_id_fkey` | `order_items` | `seller_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `orders_shipping_address_id_fkey` | `orders` | `shipping_address_id` | `shipping_addresses` | `id` | NO ACTION | NO ACTION |
| `orders_user_id_fkey` | `orders` | `user_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `post_likes_post_id_fkey` | `post_likes` | `post_id` | `posts` | `id` | CASCADE | NO ACTION |
| `post_likes_user_id_fkey` | `post_likes` | `user_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `posts_user_id_fkey` | `posts` | `user_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `shipping_addresses_user_id_fkey` | `shipping_addresses` | `user_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `nsh_wallets_user_id_fkey` | `nsh_wallets` | `user_id` | `auth.users` | `id` | CASCADE | NO ACTION |
| `threads_auth_request_id_fkey` | `threads` | `auth_request_id` | `auth_requests` | `id` | NO ACTION | NO ACTION |
| `threads_typing_user_id_fkey` | `threads` | `typing_user_id` | `auth.users` | `id` | NO ACTION | NO ACTION |
| `messages_thread_id_fkey` | `messages` | `thread_id` | `threads` | `id` | CASCADE | NO ACTION |
| `messages_sender_id_fkey` | `messages` | `sender_id` | `auth.users` | `id` | CASCADE | NO ACTION |

**Total Foreign Keys:** 25

**Note:** The comprehensive overview query shows 19 foreign keys, but only 18 are documented above. This may include a foreign key from `auth.users` or a system-level constraint.

---

## Functions (RPC)

### Function: `handle_new_user`
**Description:** Automatically creates a profile when a new user signs up via Supabase Auth

**Parameters:** None (Trigger function)

**Returns:** `trigger`

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name', -- We map auth metadata 'full_name' to table column 'display_name'
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Default role
  );
  return new;
end;
$function$
```

**Status:** ✅ Active  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE

---

### Function: `update_updated_at_column`
**Description:** Automatically updates the `updated_at` timestamp column when a row is updated

**Parameters:** None (Trigger function)

**Returns:** `trigger`

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$
```

**Status:** ✅ Active  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE

---

### Function: `get_wallet_balance`
**Description:** Gets the wallet balance for the current user, creating a wallet if it doesn't exist

**Parameters:** None

**Returns:** `DECIMAL` - Wallet balance (0.00 if wallet doesn't exist)

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.get_wallet_balance()
RETURNS DECIMAL AS $$
DECLARE
    wallet_balance DECIMAL;
BEGIN
    SELECT COALESCE(balance, 0) INTO wallet_balance 
    FROM public.nsh_wallets 
    WHERE user_id = auth.uid();
    
    -- If wallet doesn't exist, create it with 0 balance
    IF wallet_balance IS NULL THEN
        INSERT INTO public.nsh_wallets (user_id, balance)
        VALUES (auth.uid(), 0.00)
        ON CONFLICT (user_id) DO NOTHING;
        RETURN 0.00;
    END IF;
    
    RETURN wallet_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status:** ✅ Active  
**Security:** SECURITY DEFINER

---

### Function: `claim_demo_coins`
**Description:** Adds 100 demo NSH coins to the current user's wallet (for testing)

**Parameters:** None

**Returns:** `void`

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.claim_demo_coins()
RETURNS void AS $$
BEGIN
    INSERT INTO public.nsh_wallets (user_id, balance)
    VALUES (auth.uid(), 100.00)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = nsh_wallets.balance + 100.00,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status:** ✅ Active  
**Security:** SECURITY DEFINER

---

### Function: `pay_for_auth_request`
**Description:** Deducts NSH coins from user's wallet for expert authentication payment

**Parameters:**
- `amount` (DECIMAL) - Amount to deduct

**Returns:** `boolean` - true if payment successful, false if insufficient balance

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.pay_for_auth_request(amount DECIMAL)
RETURNS boolean AS $$
DECLARE
    current_bal DECIMAL;
BEGIN
    -- Get or create wallet
    SELECT COALESCE(balance, 0) INTO current_bal 
    FROM public.nsh_wallets 
    WHERE user_id = auth.uid();
    
    -- Create wallet if doesn't exist
    IF current_bal IS NULL THEN
        INSERT INTO public.nsh_wallets (user_id, balance)
        VALUES (auth.uid(), 0.00)
        ON CONFLICT (user_id) DO NOTHING;
        current_bal := 0.00;
    END IF;
    
    -- Check balance
    IF current_bal < amount THEN
        RETURN false;
    END IF;

    -- Deduct amount
    UPDATE public.nsh_wallets 
    SET balance = balance - amount,
        updated_at = now()
    WHERE user_id = auth.uid();
    
    -- Log transaction
    INSERT INTO public.nsh_wallet_transactions (
        user_id, 
        amount, 
        transaction_type, 
        description,
        reference_id
    )
    VALUES (
        auth.uid(), 
        -amount, 
        'debit', 
        'Expert Authentication Fee',
        NULL
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status:** ✅ Active  
**Security:** SECURITY DEFINER

---

### Function: `end_expert_session`
**Description:** Ends an expert authentication session (sets thread to inactive and updates auth request status)

**Parameters:**
- `thread_id_param` (UUID) - Thread ID to end

**Returns:** `boolean` - true if successful, false if thread not found or user not authorized

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.end_expert_session(thread_id_param UUID)
RETURNS boolean AS $$
DECLARE
    thread_record RECORD;
BEGIN
    -- Get thread details
    SELECT * INTO thread_record
    FROM public.threads
    WHERE id = thread_id_param;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if user is participant (expert or admin)
    IF NOT (auth.uid() = ANY(thread_record.participant_ids) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'expert'))) THEN
        RETURN false;
    END IF;
    
    -- Update thread to inactive
    UPDATE public.threads
    SET is_active = false,
        ended_at = now()
    WHERE id = thread_id_param;
    
    -- Update auth request status if exists
    IF thread_record.auth_request_id IS NOT NULL THEN
        UPDATE public.auth_requests
        SET status = 'completed',
            updated_at = now()
        WHERE id = thread_record.auth_request_id
        AND status = 'in_review';
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status:** ✅ Active  
**Security:** SECURITY DEFINER

---

### Function: `set_typing_indicator`
**Description:** Sets or clears typing indicator for a thread

**Parameters:**
- `thread_id_param` (UUID) - Thread ID
- `is_typing` (BOOLEAN) - true to set typing, false to clear

**Returns:** `void`

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.set_typing_indicator(thread_id_param UUID, is_typing BOOLEAN)
RETURNS void AS $$
BEGIN
    IF is_typing THEN
        UPDATE public.threads
        SET typing_user_id = auth.uid()
        WHERE id = thread_id_param
        AND auth.uid() = ANY(participant_ids);
    ELSE
        UPDATE public.threads
        SET typing_user_id = NULL
        WHERE id = thread_id_param
        AND typing_user_id = auth.uid();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status:** ✅ Active  
**Security:** SECURITY DEFINER

---

## Triggers

| Trigger Name | Table | Event | Timing | Function | Description | Status |
|--------------|-------|-------|--------|----------|-------------|--------|
| `update_coins_modtime` | `coin_listings` | UPDATE | BEFORE | `update_updated_at_column()` | Auto-update `updated_at` on coin listings | ✅ Active |
| `update_orders_modtime` | `orders` | UPDATE | BEFORE | `update_updated_at_column()` | Auto-update `updated_at` on orders | ✅ Active |
| `update_profiles_modtime` | `profiles` | UPDATE | BEFORE | `update_updated_at_column()` | Auto-update `updated_at` on profiles | ✅ Active |
| `update_nsh_wallets_modtime` | `nsh_wallets` | UPDATE | BEFORE | `update_wallet_updated_at()` | Auto-update `updated_at` on wallets | ✅ Active |
| `trigger_notify_expert_new_request` | `auth_requests` | UPDATE | AFTER | `notify_expert_new_request()` | Notify expert when assigned to request | ✅ Active |
| `trigger_create_thread_on_assignment` | `auth_requests` | UPDATE | AFTER | `create_thread_on_expert_assignment()` | Auto-create thread when expert assigned | ✅ Active |

**Total Triggers:** 6

**Note:** There should also be a trigger on `auth.users` for `handle_new_user()` but it's not shown in the query results. This is typically created in Supabase Auth settings.

---

## Storage Buckets

| Bucket Name | Public | File Size Limit | Allowed MIME Types | Description | Created At |
|-------------|--------|-----------------|-------------------|-------------|------------|
| `avatars` | ✅ Yes | No limit | All types | User profile avatars | 2025-12-12 |
| `coins` | ✅ Yes | No limit | All types | Coin listing images | 2025-12-12 |
| `misc` | ✅ Yes | No limit | All types | Miscellaneous files | 2025-12-12 |
| `stories` | ✅ Yes | No limit | All types | Admin story media | 2025-12-12 |

**Total Buckets:** 4

**Notes:**
- All buckets are public (no authentication required for read access)
- No file size limits are currently set
- All MIME types are allowed (no restrictions)
- All buckets were created on 2025-12-12

### Bucket Policies
⚠️ **Storage bucket policies pending** - Run query 14 from `SCHEMA_EXTRACTION_QUERIES.md` to get policy details.

---

## Policies (RLS)

### Table: `admin_stories`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Admins manage stories.` | ALL | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)` | Admins can manage all stories | ✅ Active |
| `Public view, Admin manage.` | SELECT | All rows | `true` | Everyone can view stories | ✅ Active |

---

### Table: `auth_requests`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Users can view and create own requests.` | ALL | Own rows | `auth.uid() = user_id` | Users can manage their own requests | ✅ Active |
| `Experts/Admins can view all requests.` | SELECT | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin'::user_role, 'expert'::user_role))` | Experts and admins can view all | ✅ Active |
| `Experts/Admins can update requests.` | UPDATE | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin'::user_role, 'expert'::user_role))` | Experts and admins can update | ✅ Active |

---

### Table: `coin_categories`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Categories are viewable by everyone.` | SELECT | All rows | `true` | Public read access | ✅ Active |

---

### Table: `coin_images`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Images are viewable by everyone.` | SELECT | All rows | `true` | Public read access | ✅ Active |
| `Sellers can manage images.` | ALL | Own listings | `EXISTS (SELECT 1 FROM coin_listings WHERE coin_listings.id = coin_images.coin_id AND coin_listings.seller_id = auth.uid())` | Sellers can manage their listing images | ✅ Active |

---

### Table: `coin_listings`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Active listings are viewable by everyone.` | SELECT | All rows | `(status = 'active'::listing_status) OR (auth.uid() = seller_id)` | Public can view active, sellers can view own | ✅ Active |
| `Users can insert their own listings.` | INSERT | Own rows | `auth.uid() = seller_id` | Users can create listings | ✅ Active |
| `Users can update their own listings.` | UPDATE | Own rows | `auth.uid() = seller_id` | Users can update own listings | ✅ Active |
| `Users can delete their own listings.` | DELETE | Own rows | `auth.uid() = seller_id` | Users can delete own listings | ✅ Active |

---

### Table: `discounts`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Users can read active codes.` | SELECT | Active rows | `is_active = true` | Public can view active discounts | ✅ Active |
| `Admins manage discounts.` | ALL | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)` | Admins can manage all discounts | ✅ Active |

---

### Table: `featured_coin_configs`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Public view featured.` | SELECT | Active rows | `is_active = true` | Public can view active featured coins | ✅ Active |
| `Admins manage featured.` | ALL | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)` | Admins can manage all featured configs | ✅ Active |

---

### Table: `home_feed_items`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Public view feed.` | SELECT | Visible rows | `is_visible = true` | Public can view visible feed items | ✅ Active |
| `Admins manage feed.` | ALL | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)` | Admins can manage all feed items | ✅ Active |

---

### Table: `nsh_wallet_transactions`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Users view own wallet.` | SELECT | Own rows | `auth.uid() = user_id` | Users can view own transactions | ✅ Active |
| `Admins manage wallet.` | ALL | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)` | Admins can manage all transactions | ✅ Active |

---

### Table: `orders`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Users see own orders.` | SELECT | Own rows | `auth.uid() = user_id` | Users can view own orders | ✅ Active |
| `Admins see all orders.` | SELECT | All rows | `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)` | Admins can view all orders | ✅ Active |

---

### Table: `posts`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Public posts.` | SELECT | All rows | `true` | Public can view all posts | ✅ Active |
| `Users create posts.` | INSERT | Own rows | `auth.uid() = user_id` | Users can create posts | ✅ Active |

---

### Table: `profiles`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Public profiles are viewable by everyone.` | SELECT | All rows | `true` | Public can view all profiles | ✅ Active |
| `Users can insert their own profile.` | INSERT | Own row | `auth.uid() = id` | Users can create own profile | ✅ Active |
| `Users can update own profile.` | UPDATE | Own row | `auth.uid() = id` | Users can update own profile | ✅ Active |

---

### Table: `shipping_addresses`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Users manage own addresses.` | ALL | Own rows | `auth.uid() = user_id` | Users can manage own addresses | ✅ Active |

---

### Table: `nsh_wallets`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Users view own wallet` | SELECT | Own rows | `auth.uid() = user_id` | Users can view own wallet | ✅ Active |
| `Admins view all wallets` | SELECT | All rows | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` | Admins can view all wallets | ✅ Active |

---

### Table: `threads`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Participants view threads` | SELECT | All rows | `auth.uid() = ANY(participant_ids) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'expert'))` | Participants and experts/admins can view threads | ✅ Active |
| `Participants manage threads` | ALL | All rows | `auth.uid() = ANY(participant_ids) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` | Participants and admins can manage threads | ✅ Active |

---

### Table: `messages`

| Policy Name | Operation | Target | Using Expression | Description | Status |
|-------------|-----------|--------|------------------|-------------|--------|
| `Participants view messages` | SELECT | All rows | `EXISTS (SELECT 1 FROM threads WHERE id = messages.thread_id AND (auth.uid() = ANY(participant_ids) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'expert'))))` | Participants and experts/admins can view messages | ✅ Active |
| `Participants manage messages` | ALL | All rows | `EXISTS (SELECT 1 FROM threads WHERE id = messages.thread_id AND auth.uid() = ANY(participant_ids))` | Participants can manage messages in their threads | ✅ Active |

---

**Total RLS Policies:** 30

---

## Extensions

| Extension Name | Version | Description | Status |
|----------------|---------|-------------|--------|
| `pg_graphql` | 1.5.11 | GraphQL API support for Supabase | ✅ Active |
| `pg_stat_statements` | 1.11 | Query performance statistics | ✅ Active |
| `pgcrypto` | 1.3 | Cryptographic functions | ✅ Active |
| `plpgsql` | 1.0 | PL/pgSQL procedural language | ✅ Active |
| `supabase_vault` | 0.3.1 | Supabase Vault for secrets management | ✅ Active |
| `uuid-ossp` | 1.1 | UUID generation functions | ✅ Active |

**Total Extensions:** 6

**Notes:**
- `uuid-ossp` is used for generating UUIDs in default column values
- `pgcrypto` provides encryption/hashing functions
- `pg_graphql` enables GraphQL API endpoints
- `pg_stat_statements` tracks query performance

---

## Change Log

### 2025-01-27 - Complete Schema Documentation
**Type:** Added  
**Details:**
- Documented all 16 tables with column information
- Documented 22 indexes
- Documented 19 foreign key relationships
- Documented 2 functions (RPC)
- Documented 3 triggers
- Documented 25 RLS policies
- Documented 6 extensions
- Documented 4 storage buckets
- Documented table sizes for all tables
- ✅ Completed: All column data for `orders`, `post_likes`, `posts`, `profiles`, `shipping_addresses`
- ⚠️ Pending: Storage bucket policies

**Queries Executed:**
```sql
-- Query 1: Get All Tables
-- Status: ✅ Success

-- Query 2: Get All Columns
-- Status: ✅ Success (complete - all tables documented)

-- Query 3: Get All Indexes
-- Status: ✅ Success

-- Query 4: Get All Foreign Keys
-- Status: ✅ Success

-- Query 5: Get All Primary Keys
-- Status: ✅ Success

-- Query 6: Get All Functions
-- Status: ✅ Success

-- Query 7: Get Function Definitions
-- Status: ✅ Success

-- Query 8: Get All Triggers
-- Status: ✅ Success

-- Query 9: Get All RLS Policies
-- Status: ✅ Success

-- Query 10: Get All Extensions
-- Status: ✅ Success (initially empty, now populated)

-- Query 11: Get All Views
-- Status: ✅ Success (no views found)

-- Query 12: Get All Extensions (detailed)
-- Status: ✅ Success (6 extensions found)

-- Query 13: Get Storage Buckets
-- Status: ✅ Success (4 buckets found)

-- Query 16: Get Table Sizes
-- Status: ✅ Success (all 16 tables documented)

-- Query: Comprehensive Overview
-- Status: ✅ Success
-- Results: 16 tables, 2 functions, 3 triggers, 22 indexes, 19 foreign keys

### 2025-01-27 - Added Missing Column Data
**Type:** Added  
**Details:**
- Added complete column information for `orders` table (9 columns)
- Added complete column information for `post_likes` table (4 columns)
- Added complete column information for `posts` table (5 columns)
- Added complete column information for `profiles` table (15 columns)
- Added complete column information for `shipping_addresses` table (12 columns)
- All tables now have complete documentation

**Queries Executed:**
```sql
-- Get Missing Columns for orders, post_likes, posts, profiles, shipping_addresses
-- Status: ✅ Success
-- All 5 tables now have complete column documentation
```

---

## Quick Reference Queries

### Get All Tables
```sql
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Get All Columns for a Table
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = '[TABLE_NAME]'
ORDER BY ordinal_position;
```

### Get All Functions
```sql
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### Get All Triggers
```sql
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Get All Indexes
```sql
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Get All Foreign Keys
```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
```

---

## Notes

- **Enum Types Used:**
  - `user_role`: `'user'`, `'expert'`, `'admin'`
  - `listing_status`: `'draft'`, `'active'`, `'pending_approval'`, `'sold'`, `'delisted'`
  - `auth_request_status`: `'pending'`, `'in_review'`, `'completed'`, `'rejected'`
  - `order_status`: `'pending'`, `'payment_pending'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`, `'refunded'`

- **Cascade Deletes:**
  - `coin_images` → `coin_listings` (CASCADE)
  - `featured_coin_configs` → `coin_listings` (CASCADE)
  - `order_items` → `orders` (CASCADE)
  - `post_likes` → `posts` (CASCADE)

- **Important Relationships:**
  - `profiles` is the central user table, referenced by most other tables
  - `coin_listings` is the main marketplace entity
  - `orders` and `order_items` form a one-to-many relationship
  - `auth_requests` links users to experts for authentication

- **RLS Policy Patterns:**
  - Public read access: Many tables allow public SELECT
  - User ownership: Users can manage their own data
  - Admin access: Admins have full access to management tables
  - Expert access: Experts can view/update authentication requests
