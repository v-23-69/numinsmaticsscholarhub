# Shopify Integration Setup Guide

## Overview
The NSH app is now ready for Shopify integration! Products added in Shopify can be synced to the NSH marketplace and displayed alongside regular coin listings.

## What's Been Set Up

### 1. Database Schema
- Added `shopify_product_id`, `shopify_variant_id`, `shopify_handle`, and `is_shopify_product` fields to `coin_listings` table
- Migration file: `supabase/migrations/20250101000000_add_shopify_fields.sql`

### 2. Shopify Sync Function
- Edge function at `supabase/functions/shopify-sync/index.ts`
- Syncs products from Shopify Storefront API to `coin_listings` table
- Handles both new products and updates to existing products
- Syncs product images automatically

### 3. Admin Panel
- Updated `ShopifySyncManager` component with real sync functionality
- Test connection button to verify Shopify credentials
- Sync button to pull products from Shopify
- Real-time stats showing:
  - Number of synced products
  - Connection status
  - Last sync time
  - Sync activity logs

### 4. Marketplace Integration
- Marketplace automatically displays Shopify products (they're in `coin_listings` table)
- Cart integration works with Shopify products
- Uses correct Shopify variant IDs for checkout

## Setup Instructions

### Step 1: Configure Shopify Credentials

1. **Get your Shopify Storefront Access Token:**
   - Go to your Shopify Admin → Settings → Apps and sales channels
   - Create a Private App or use an existing one
   - Enable Storefront API access
   - Copy the Storefront API access token

2. **Set Environment Variables in Supabase:**
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add the following secrets:
     ```
     SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
     SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
     SHOPIFY_ACCESS_TOKEN=your-admin-access-token (optional, for Admin API)
     ```

### Step 2: Run Database Migration

The migration should run automatically, but if needed:
```sql
-- Run the migration file
supabase/migrations/20250101000000_add_shopify_fields.sql
```

### Step 3: Test Connection

1. Go to Admin Dashboard → Shopify
2. Click "Connect Shopify" button
3. This will test the connection to your Shopify store

### Step 4: Sync Products

1. After connection is successful, click "Sync Now"
2. The system will:
   - Fetch all products from Shopify
   - Create/update listings in `coin_listings` table
   - Sync product images
   - Mark products as `is_shopify_product = true`

### Step 5: Add Products in Shopify

1. Go to your Shopify Admin → Products
2. Add a new product with:
   - Title (will be used as coin title)
   - Description (will be used as coin description)
   - Price (will be used as listing price)
   - Images (first image will be used as front image)
3. Save the product
4. Go back to NSH Admin → Shopify → Sync Now

## How It Works

### Product Sync Flow
1. Admin clicks "Sync Now" in ShopifySyncManager
2. Edge function fetches products from Shopify Storefront API
3. For each product:
   - Checks if product already exists (by `shopify_product_id`)
   - If exists: Updates the listing
   - If new: Creates a new listing in `coin_listings`
   - Syncs product images to `coin_images` table
4. Products are marked with `is_shopify_product = true`

### Marketplace Display
- Shopify products appear in the marketplace automatically
- They're fetched from `coin_listings` table like regular listings
- Filtered and sorted the same way as regular coins

### Cart & Checkout
- When user adds a Shopify product to cart, it uses the Shopify variant ID
- Checkout redirects to Shopify checkout page
- Uses Shopify's native payment processing

## Important Notes

1. **Shopify Subscription Required:**
   - You need an active Shopify subscription (the 20rs plan you mentioned)
   - Storefront API requires an active plan

2. **Product Mapping:**
   - Shopify products are mapped to `coin_listings` table
   - The first variant is used for pricing
   - First image is used as the front image

3. **Admin User:**
   - Synced products are assigned to the admin user (the one who runs the sync)
   - This ensures proper ownership and permissions

4. **Regular Updates:**
   - Run sync periodically to keep products updated
   - Price changes in Shopify will update in NSH after sync
   - Stock changes can be synced (future enhancement)

## Troubleshooting

### Connection Fails
- Check that `SHOPIFY_SHOP_DOMAIN` is correct (without https://)
- Verify `SHOPIFY_STOREFRONT_TOKEN` is valid
- Ensure Shopify subscription is active

### Sync Fails
- Check Edge Function logs in Supabase Dashboard
- Verify Storefront API access is enabled in Shopify
- Check that products exist in Shopify

### Products Not Showing
- Verify sync completed successfully
- Check `coin_listings` table for `is_shopify_product = true`
- Ensure products have `status = 'active'`

## Future Enhancements

- Automatic sync via webhooks
- Inventory sync
- Order status updates
- Multi-variant support
- Product categories mapping

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check browser console for errors
3. Verify Shopify API credentials
4. Ensure database migration ran successfully



